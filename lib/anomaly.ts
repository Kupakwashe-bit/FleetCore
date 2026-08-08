import { VehicleCategory } from '@prisma/client';
import { prisma } from './prisma';

// Expected fuel consumption baseline in Liters per 100km per vehicle category
export const CATEGORY_FUEL_BASELINE_L100KM: Record<VehicleCategory, number> = {
  TRICYCLE: 3.5,
  SMALL_VEHICLE: 7.5,
  BUS_TAXI: 12.0,
  LORRY: 22.0,
  HAULAGE_TRUCK: 36.0,
};

export interface CheckTripAnomalyInput {
  tripId: string;
  vehicleId: string;
  driverId: string;
  category: VehicleCategory;
  distanceKm: number;
  fuelConsumedL: number;
  startOdometerKm: number;
  endOdometerKm: number;
  scheduledStart: Date;
  actualStart?: Date | null;
}

export async function runAnomalyDetection(input: CheckTripAnomalyInput) {
  const alertsCreated = [];

  // Rule 1: Fuel Consumption Spike Check
  if (input.distanceKm > 10 && input.fuelConsumedL > 0) {
    const actualConsumptionL100km = (input.fuelConsumedL / input.distanceKm) * 100;
    const baseline = CATEGORY_FUEL_BASELINE_L100KM[input.category] || 15.0;
    const maxThreshold = baseline * 1.30; // 30% over baseline trigger

    if (actualConsumptionL100km > maxThreshold) {
      const alert = await prisma.fraudAlert.create({
        data: {
          tripId: input.tripId,
          vehicleId: input.vehicleId,
          driverId: input.driverId,
          anomalyType: 'EXCESS_FUEL_CONSUMPTION',
          severity: actualConsumptionL100km > baseline * 1.6 ? 'CRITICAL' : 'HIGH',
          details: `Trip logged ${actualConsumptionL100km.toFixed(1)} L/100km vs category baseline of ${baseline.toFixed(1)} L/100km (${((actualConsumptionL100km/baseline - 1)*100).toFixed(0)}% excess). Fuel volume: ${input.fuelConsumedL}L over ${input.distanceKm.toFixed(1)} km.`,
          expectedValue: `${baseline.toFixed(1)} L/100km`,
          actualValue: `${actualConsumptionL100km.toFixed(1)} L/100km`,
          status: 'PENDING_REVIEW',
        },
      });
      alertsCreated.push(alert);
    }
  }

  // Rule 2: Odometer Mismatch Check
  const odometerDiff = input.endOdometerKm - input.startOdometerKm;
  if (odometerDiff <= 0 || (input.distanceKm > 0 && Math.abs(odometerDiff - input.distanceKm) > 25)) {
    const alert = await prisma.fraudAlert.create({
      data: {
        tripId: input.tripId,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        anomalyType: 'ODOMETER_MISMATCH',
        severity: 'HIGH',
        details: `Odometer delta (${odometerDiff.toFixed(1)} km) differs significantly from GPS route distance (${input.distanceKm.toFixed(1)} km). Gap: ${Math.abs(odometerDiff - input.distanceKm).toFixed(1)} km.`,
        expectedValue: `${input.distanceKm.toFixed(1)} km`,
        actualValue: `${odometerDiff.toFixed(1)} km`,
        status: 'PENDING_REVIEW',
      },
    });
    alertsCreated.push(alert);
  }

  return alertsCreated;
}
