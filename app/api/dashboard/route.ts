import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get('depotId');

    const vehicleWhere: any = {};
    const tripWhere: any = { status: 'EN_ROUTE' };
    const driverWhere: any = {};

    if (depotId && depotId !== 'ALL') {
      vehicleWhere.depotId = depotId;
      tripWhere.originDepotId = depotId;
      driverWhere.depotId = depotId;
    }

    const [
      totalVehicles,
      activeVehicles,
      dispatchedVehicles,
      maintenanceVehicles,
      resoldVehicles,
      totalDrivers,
      onTripDrivers,
      availableDrivers,
      activeTrips,
      complianceExpired,
      complianceExpiringSoon,
      pendingFraudAlerts,
      activeIncidents,
      recentIncidents,
      categoryCounts,
    ] = await Promise.all([
      prisma.vehicle.count({ where: vehicleWhere }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'DISPATCHED' } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'MAINTENANCE' } }),
      prisma.vehicle.count({ where: { ...vehicleWhere, status: 'RESOLD' } }),
      prisma.driver.count({ where: driverWhere }),
      prisma.driver.count({ where: { ...driverWhere, status: 'ON_TRIP' } }),
      prisma.driver.count({ where: { ...driverWhere, status: 'AVAILABLE' } }),
      prisma.trip.count({ where: tripWhere }),
      prisma.complianceDoc.count({ where: { status: 'EXPIRED' } }),
      prisma.complianceDoc.count({ where: { status: 'EXPIRING_SOON' } }),
      prisma.fraudAlert.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.incident.count({ where: { status: { in: ['REPORTED', 'UNDER_INVESTIGATION', 'RESCUE_DISPATCHED'] } } }),
      prisma.incident.findMany({
        where: { status: { not: 'RESOLVED' } },
        include: {
          vehicle: true,
          driver: { include: { user: true } },
          rescueVehicle: true,
        },
        orderBy: { reportedAt: 'desc' },
        take: 3,
      }),
      prisma.vehicle.groupBy({
        by: ['category'],
        where: vehicleWhere,
        _count: { category: true },
      }),
    ]);

    return NextResponse.json({
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        dispatched: dispatchedVehicles,
        maintenance: maintenanceVehicles,
        resold: resoldVehicles,
        categories: categoryCounts.map((c) => ({
          category: c.category,
          count: c._count.category,
        })),
      },
      drivers: {
        total: totalDrivers,
        onTrip: onTripDrivers,
        available: availableDrivers,
      },
      trips: {
        activeEnRoute: activeTrips,
      },
      compliance: {
        expired: complianceExpired,
        expiringSoon: complianceExpiringSoon,
        totalAlerts: complianceExpired + complianceExpiringSoon,
      },
      fraud: {
        pendingReview: pendingFraudAlerts,
      },
      incidents: {
        activeCount: activeIncidents,
        recent: recentIncidents,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
