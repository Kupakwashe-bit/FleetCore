import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get('depotId');
    const status = searchParams.get('status');

    const where: any = {};
    if (depotId && depotId !== 'ALL') where.originDepotId = depotId;
    if (status && status !== 'ALL') where.status = status;

    const trips = await prisma.trip.findMany({
      where,
      include: {
        originDepot: true,
        vehicle: true,
        driver: { include: { user: true } },
        dispatcherUser: { select: { name: true } },
        incidents: true,
        fraudAlerts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(trips);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate unique Trip Code
    const tripCode = `TRP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const vehicle = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

    const trip = await prisma.trip.create({
      data: {
        tripCode,
        originDepotId: body.originDepotId,
        destinationName: body.destinationName,
        cargoDescription: body.cargoDescription,
        cargoWeightKg: parseFloat(body.cargoWeightKg || 0),
        passengerCount: parseInt(body.passengerCount || 0),
        scheduledStart: new Date(body.scheduledStart),
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        dispatcherUserId: body.dispatcherUserId,
        startOdometerKm: vehicle.odometerKm,
        startFuelLevelL: parseFloat(body.startFuelLevelL || 50),
        status: 'SCHEDULED',
      },
    });

    // Set Vehicle to DISPATCHED
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { status: 'DISPATCHED' },
    });

    // Set Driver to ON_TRIP
    await prisma.driver.update({
      where: { id: body.driverId },
      data: { status: 'ON_TRIP' },
    });

    await logAuditEvent({
      userId: body.dispatcherUserId,
      userRole: 'DISPATCHER',
      userEmail: 'dispatch@motalink.co.zw',
      action: 'CREATE',
      entityName: 'Trip',
      entityId: trip.id,
      newData: trip,
      depotId: trip.originDepotId,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
