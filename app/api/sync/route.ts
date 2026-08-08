import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAnomalyDetection } from '@/lib/anomaly';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const processedResults = [];

    for (const item of items) {
      const trip = await prisma.trip.findUnique({
        where: { id: item.tripId },
        include: { vehicle: true },
      });

      if (!trip) continue;

      // 1. Update Trip details
      const updatedTrip = await prisma.trip.update({
        where: { id: item.tripId },
        data: {
          endOdometerKm: item.endOdometerKm,
          endFuelLevelL: item.endFuelLevelL,
          fuelAddedL: (trip.fuelAddedL || 0) + (item.fuelAddedL || 0),
          fuelCostUSD: (trip.fuelCostUSD || 0) + (item.fuelCostUSD || 0),
          actualEnd: new Date(item.timestamp),
          status: 'COMPLETED',
          isOfflineSubmitted: true,
          syncUuid: item.syncUuid,
        },
      });

      // Update vehicle odometer & set status back to ACTIVE
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          odometerKm: Math.max(trip.vehicle.odometerKm, item.endOdometerKm),
          status: 'ACTIVE',
        },
      });

      // Update Driver status back to AVAILABLE
      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });

      // 2. Store location pings
      if (Array.isArray(item.pings) && item.pings.length > 0) {
        await prisma.locationPing.createMany({
          data: item.pings.map((p: any) => ({
            tripId: trip.id,
            driverId: trip.driverId,
            latitude: p.latitude,
            longitude: p.longitude,
            speedKmh: p.speedKmh || 0,
            timestamp: new Date(p.timestamp),
            isOfflineCaptured: true,
          })),
        });
      }

      // 3. Run Automated Anomaly & Fraud Detection Engine
      const distanceKm = item.endOdometerKm - trip.startOdometerKm;
      const fuelConsumedL = (trip.startFuelLevelL + (item.fuelAddedL || 0)) - item.endFuelLevelL;

      const anomalies = await runAnomalyDetection({
        tripId: trip.id,
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
        category: trip.vehicle.category,
        distanceKm,
        fuelConsumedL: Math.max(0, fuelConsumedL),
        startOdometerKm: trip.startOdometerKm,
        endOdometerKm: item.endOdometerKm,
        scheduledStart: trip.scheduledStart,
      });

      // 4. Log Immutable Audit Entry for Sync
      await logAuditEvent({
        userId: trip.driverId,
        userRole: 'DRIVER',
        userEmail: 'driver.sync@motalink.co.zw',
        action: 'SYNC',
        entityName: 'Trip',
        entityId: trip.id,
        newData: {
          endOdometerKm: item.endOdometerKm,
          fuelAddedL: item.fuelAddedL,
          anomaliesFlagged: anomalies.length,
          syncUuid: item.syncUuid,
        },
        depotId: trip.originDepotId,
      });

      processedResults.push({ tripId: trip.id, anomaliesCount: anomalies.length });
    }

    return NextResponse.json({
      success: true,
      processed: processedResults.length,
      details: processedResults,
    });
  } catch (error: any) {
    console.error('API /sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
