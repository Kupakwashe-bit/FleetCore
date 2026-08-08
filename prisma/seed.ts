import { PrismaClient, Role, VehicleCategory, FuelType, VehicleStatus, DriverStatus, TripStatus, ServiceType, DocType, DocStatus, IncidentType, IncidentSeverity, IncidentStatus, AnomalyType, AnomalyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MotaLink Zimbabwean Fleet Database...');

  // 1. Create Depots
  const hreDepot = await prisma.depot.upsert({
    where: { code: 'HRE-DEPOT' },
    update: {},
    create: {
      code: 'HRE-DEPOT',
      name: 'Harare Central Logistics Hub',
      city: 'Harare',
      address: '122 Simon Mazorodze Rd, Southerton',
      contactPhone: '+263 242 754 890',
    },
  });

  const byoHub = await prisma.depot.upsert({
    where: { code: 'BYO-HUB' },
    update: {},
    create: {
      code: 'BYO-HUB',
      name: 'Bulawayo Freight Terminal',
      city: 'Bulawayo',
      address: '45 Khami Road, Belmont',
      contactPhone: '+263 292 688 120',
    },
  });

  const mtrDepot = await prisma.depot.upsert({
    where: { code: 'MTR-DEPOT' },
    update: {},
    create: {
      code: 'MTR-DEPOT',
      name: 'Mutare Border Transit Station',
      city: 'Mutare',
      address: '12 Park Road, Forbes Border Post Link',
      contactPhone: '+263 202 612 300',
    },
  });

  const gwuYard = await prisma.depot.upsert({
    where: { code: 'GWU-YARD' },
    update: {},
    create: {
      code: 'GWU-YARD',
      name: 'Gweru Industrial Yard',
      city: 'Gweru',
      address: '89 Halifax Rd, Heavy Industrial Sites',
      contactPhone: '+263 254 223 440',
    },
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@motalink.co.zw' },
    update: {},
    create: {
      name: 'Kudzai Moyo (System Admin)',
      email: 'admin@motalink.co.zw',
      passwordHash,
      role: Role.ADMIN,
      depotId: hreDepot.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@motalink.co.zw' },
    update: {},
    create: {
      name: 'Tinashe Ncube (Fleet Mgr)',
      email: 'manager@motalink.co.zw',
      passwordHash,
      role: Role.FLEET_MANAGER,
      depotId: hreDepot.id,
    },
  });

  const dispatchUser = await prisma.user.upsert({
    where: { email: 'dispatch@motalink.co.zw' },
    update: {},
    create: {
      name: 'Chipo Sibanda (Head Dispatcher)',
      email: 'dispatch@motalink.co.zw',
      passwordHash,
      role: Role.DISPATCHER,
      depotId: hreDepot.id,
    },
  });

  const driverUser1 = await prisma.user.upsert({
    where: { email: 'driver.tendai@motalink.co.zw' },
    update: {},
    create: {
      name: 'Tendai Mutasa',
      email: 'driver.tendai@motalink.co.zw',
      passwordHash,
      role: Role.DRIVER,
      depotId: hreDepot.id,
    },
  });

  const driverUser2 = await prisma.user.upsert({
    where: { email: 'driver.farai@motalink.co.zw' },
    update: {},
    create: {
      name: 'Farai Dube',
      email: 'driver.farai@motalink.co.zw',
      passwordHash,
      role: Role.DRIVER,
      depotId: byoHub.id,
    },
  });

  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@motalink.co.zw' },
    update: {},
    create: {
      name: 'Rudo Mpofu (Compliance Auditor)',
      email: 'auditor@motalink.co.zw',
      passwordHash,
      role: Role.AUDITOR,
      depotId: hreDepot.id,
    },
  });

  // 3. Create Drivers Profiles
  const driver1 = await prisma.driver.upsert({
    where: { userId: driverUser1.id },
    update: {},
    create: {
      userId: driverUser1.id,
      licenseNumber: 'ZIM-DL-984021',
      licenseClasses: 'Class 1 Heavy, Class 2 Bus',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      medicalCertExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: DriverStatus.ON_TRIP,
      depotId: hreDepot.id,
      safetyRating: 4.8,
      efficiencyRating: 4.6,
      punctualityRating: 4.9,
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { userId: driverUser2.id },
    update: {},
    create: {
      userId: driverUser2.id,
      licenseNumber: 'ZIM-DL-412903',
      licenseClasses: 'Class 1 Heavy',
      licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      medicalCertExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: DriverStatus.AVAILABLE,
      depotId: byoHub.id,
      safetyRating: 4.9,
      efficiencyRating: 4.8,
      punctualityRating: 4.7,
    },
  });

  // 4. Create Mixed Vehicles
  const haulageTruck = await prisma.vehicle.upsert({
    where: { registrationNumber: 'AGE-4920' },
    update: {},
    create: {
      vin: '1XDF4902849102948',
      registrationNumber: 'AGE-4920',
      category: VehicleCategory.HAULAGE_TRUCK,
      make: 'DAF',
      model: 'XF 105 460 Euro 5',
      year: 2021,
      payloadCapacityKg: 32000,
      fuelType: FuelType.DIESEL,
      odometerKm: 142500,
      status: VehicleStatus.DISPATCHED,
      depotId: hreDepot.id,
    },
  });

  const lorry10Ton = await prisma.vehicle.upsert({
    where: { registrationNumber: 'BCE-9102' },
    update: {},
    create: {
      vin: '2ISZ9102837491023',
      registrationNumber: 'BCE-9102',
      category: VehicleCategory.LORRY,
      make: 'Isuzu',
      model: 'FVR 900 Heavy Lorry',
      year: 2020,
      payloadCapacityKg: 10000,
      fuelType: FuelType.DIESEL,
      odometerKm: 89400,
      status: VehicleStatus.ACTIVE,
      depotId: gwuYard.id,
    },
  });

  const busTaxi = await prisma.vehicle.upsert({
    where: { registrationNumber: 'AFG-3310' },
    update: {},
    create: {
      vin: '3TOY3310928371625',
      registrationNumber: 'AFG-3310',
      category: VehicleCategory.BUS_TAXI,
      make: 'Toyota',
      model: 'HiAce Quantum 16-Seater',
      year: 2022,
      passengerCapacity: 16,
      payloadCapacityKg: 1400,
      fuelType: FuelType.DIESEL,
      odometerKm: 56200,
      status: VehicleStatus.ACTIVE,
      depotId: byoHub.id,
    },
  });

  const smallVehicle = await prisma.vehicle.upsert({
    where: { registrationNumber: 'AEL-8819' },
    update: {},
    create: {
      vin: '4NIS8819283746152',
      registrationNumber: 'AEL-8819',
      category: VehicleCategory.SMALL_VEHICLE,
      make: 'Nissan',
      model: 'NP200 Pickup Bakkie',
      year: 2021,
      payloadCapacityKg: 800,
      fuelType: FuelType.PETROL,
      odometerKm: 42100,
      status: VehicleStatus.ACTIVE,
      depotId: mtrDepot.id,
    },
  });

  const tricycleCargo = await prisma.vehicle.upsert({
    where: { registrationNumber: 'TRC-0042' },
    update: {},
    create: {
      vin: '5BAJ0042918273645',
      registrationNumber: 'TRC-0042',
      category: VehicleCategory.TRICYCLE,
      make: 'Bajaj',
      model: 'Maxima C Cargo Tricycle',
      year: 2023,
      payloadCapacityKg: 500,
      fuelType: FuelType.PETROL,
      odometerKm: 12400,
      status: VehicleStatus.ACTIVE,
      depotId: hreDepot.id,
    },
  });

  // Decommissioned & Resold Vehicle (Preserving historical logs)
  const decommissionedVehicle = await prisma.vehicle.upsert({
    where: { registrationNumber: 'OLD-3500' },
    update: {},
    create: {
      vin: '9MAZ3500001928374',
      registrationNumber: 'OLD-3500',
      category: VehicleCategory.LORRY,
      make: 'Mazda',
      model: 'T3500 3-Ton Truck',
      year: 2012,
      payloadCapacityKg: 3500,
      fuelType: FuelType.DIESEL,
      odometerKm: 340200,
      status: VehicleStatus.RESOLD,
      depotId: hreDepot.id,
      decommissionDate: new Date('2026-03-15'),
      decommissionReason: 'High maintenance costs and engine overhaul requirements',
      resalePriceUSD: 4500,
      buyerName: 'Harare Scrap & Fleet Salvage Ltd',
      decommissionNotes: 'Sold via transparent competitive bidding. Full repair history retained in MotaLink.',
      decommissionedByUserId: adminUser.id,
    },
  });

  // 5. Compliance Documents (ZINARA, VID, Insurance, Radio License)
  await prisma.complianceDoc.createMany({
    data: [
      {
        vehicleId: haulageTruck.id,
        docType: DocType.ZINARA_LICENSE,
        documentNumber: 'ZIN-2026-HRE-9941',
        issuingAuthority: 'ZINARA Harare East',
        issueDate: new Date('2026-01-01'),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Expiring in 10 days!
        status: DocStatus.EXPIRING_SOON,
        costUSD: 180,
        notes: 'Annual vehicle license disc renewal due',
      },
      {
        vehicleId: haulageTruck.id,
        docType: DocType.VID_INSPECTION,
        documentNumber: 'VID-COF-2026-081',
        issuingAuthority: 'Vehicle Inspection Department (Belvedere)',
        issueDate: new Date('2026-02-10'),
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: DocStatus.VALID,
        costUSD: 75,
        notes: 'Roadworthiness inspection Certificate of Fitness (COF)',
      },
      {
        vehicleId: busTaxi.id,
        docType: DocType.ROUTE_PERMIT,
        documentNumber: 'RPT-BYO-GWU-042',
        issuingAuthority: 'Ministry of Transport & Infrastructure',
        issueDate: new Date('2025-11-01'),
        expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // EXPIRED!
        status: DocStatus.EXPIRED,
        costUSD: 120,
        notes: 'Intercity Passenger Route Permit Bulawayo - Gweru',
      },
    ],
  });

  // 6. Active Trip
  const activeTrip = await prisma.trip.create({
    data: {
      tripCode: 'TRP-2026-0801',
      originDepotId: hreDepot.id,
      destinationName: 'Forbes Border Post, Mutare',
      destinationCoords: '-18.972,32.671',
      cargoDescription: '28 Tonnes Fertilizer Bagged Freight',
      cargoWeightKg: 28000,
      status: TripStatus.EN_ROUTE,
      scheduledStart: new Date(Date.now() - 4 * 60 * 60 * 1000),
      actualStart: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      vehicleId: haulageTruck.id,
      driverId: driver1.id,
      dispatcherUserId: dispatchUser.id,
      startOdometerKm: 142100,
      startFuelLevelL: 450,
      syncUuid: 'sync-uuid-8891-hre-mtr',
    },
  });

  // Location Pings during active trip (Driver Privacy: Scoped to active trip)
  await prisma.locationPing.createMany({
    data: [
      {
        tripId: activeTrip.id,
        driverId: driver1.id,
        latitude: -18.152,
        longitude: 31.542,
        speedKmh: 76,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        tripId: activeTrip.id,
        driverId: driver1.id,
        latitude: -18.512,
        longitude: 32.102,
        speedKmh: 68,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  });

  // 7. Incident Ticket with Ownership Chain & Rescue Reroute
  const ownershipChain = [
    { timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), actor: 'System Alert', action: 'Incident reported by driver via mobile tablet' },
    { timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(), actor: 'Chipo Sibanda (Dispatcher)', action: 'Reviewed breakdown alert; dispatched rescue ISUZU Lorry BCE-9102 from Gweru Yard' },
  ];

  await prisma.incident.create({
    data: {
      tripId: activeTrip.id,
      vehicleId: haulageTruck.id,
      driverId: driver1.id,
      incidentType: IncidentType.BREAKDOWN,
      severity: IncidentSeverity.HIGH,
      locationName: 'A3 Highway (25km outside Marondera)',
      description: 'Turboshaft pressure loss & radiator coolant overheating on steep climb',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      ownershipChainJson: JSON.stringify(ownershipChain),
      rescueVehicleId: lorry10Ton.id,
      status: IncidentStatus.RESCUE_DISPATCHED,
      resolutionNotes: 'Rescue lorry en route to transship 10 tonnes of urgent cargo.',
    },
  });

  // 8. Fraud Alert Flag
  await prisma.fraudAlert.create({
    data: {
      tripId: activeTrip.id,
      vehicleId: haulageTruck.id,
      driverId: driver1.id,
      anomalyType: AnomalyType.EXCESS_FUEL_CONSUMPTION,
      severity: IncidentSeverity.CRITICAL,
      details: 'Unusual fuel consumption detected: Logged 54.2 L/100km vs DAF XF baseline 36.0 L/100km (50.5% spike). 180L refuel logged at informal stop.',
      expectedValue: '36.0 L/100km',
      actualValue: '54.2 L/100km',
      status: AnomalyStatus.PENDING_REVIEW,
    },
  });

  // 9. Maintenance Service Records
  await prisma.serviceRecord.create({
    data: {
      vehicleId: haulageTruck.id,
      serviceType: ServiceType.PREVENTIVE,
      description: '140,000 km Scheduled Service: Engine oil, air filter, fuel filters, brake lining inspection',
      costUSD: 650,
      odometerAtService: 140000,
      partsReplaced: 'DAF Engine Oil Filter, Fuel Water Separator, Synthetic Oil 15W40',
      serviceDate: new Date('2026-02-01'),
      vendorName: 'Zim-Truck Diesel Services (Harare)',
      nextServiceDueKm: 155000,
      nextServiceDueDate: new Date('2026-08-01'),
    },
  });

  // 10. Audit Log Initial Records
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userRole: 'ADMIN',
        userEmail: adminUser.email,
        action: 'DECOMMISSION',
        entityName: 'Vehicle',
        entityId: decommissionedVehicle.id,
        oldDataJson: JSON.stringify({ registrationNumber: 'OLD-3500', status: 'ACTIVE' }),
        newDataJson: JSON.stringify({ status: 'RESOLD', resalePriceUSD: 4500, buyerName: 'Harare Scrap & Fleet Salvage Ltd' }),
        ipAddress: '192.168.1.10',
        depotId: hreDepot.id,
      },
      {
        userId: dispatchUser.id,
        userRole: 'DISPATCHER',
        userEmail: dispatchUser.email,
        action: 'REROUTE',
        entityName: 'Incident',
        entityId: haulageTruck.id,
        oldDataJson: JSON.stringify({ status: 'REPORTED' }),
        newDataJson: JSON.stringify({ status: 'RESCUE_DISPATCHED', rescueVehicleId: lorry10Ton.id }),
        ipAddress: '192.168.1.14',
        depotId: hreDepot.id,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
