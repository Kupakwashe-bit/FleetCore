import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const serviceType = searchParams.get('serviceType');

    const where: any = {};
    if (vehicleId && vehicleId !== 'ALL') where.vehicleId = vehicleId;
    if (serviceType && serviceType !== 'ALL') where.serviceType = serviceType;

    const records = await prisma.serviceRecord.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            make: true,
            model: true,
            category: true,
            odometerKm: true,
            status: true,
            depot: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const odometerAtService = parseFloat(body.odometerAtService || vehicle.odometerKm);

    const record = await prisma.serviceRecord.create({
      data: {
        vehicleId: body.vehicleId,
        serviceType: body.serviceType || 'PREVENTIVE',
        description: body.description,
        costUSD: parseFloat(body.costUSD || 0),
        odometerAtService,
        partsReplaced: body.partsReplaced || null,
        serviceDate: new Date(body.serviceDate || new Date()),
        vendorName: body.vendorName || 'In-House Depot Workshop',
        nextServiceDueKm: body.nextServiceDueKm ? parseFloat(body.nextServiceDueKm) : null,
        nextServiceDueDate: body.nextServiceDueDate ? new Date(body.nextServiceDueDate) : null,
      },
      include: {
        vehicle: true,
      },
    });

    // If odometer logged at service is higher than vehicle's current odometer, update it
    const vehicleUpdateData: any = {};
    if (odometerAtService > vehicle.odometerKm) {
      vehicleUpdateData.odometerKm = odometerAtService;
    }
    // If vehicle was in MAINTENANCE and service is complete, return to ACTIVE if requested
    if (body.returnVehicleToActive && vehicle.status === 'MAINTENANCE') {
      vehicleUpdateData.status = 'ACTIVE';
    }

    if (Object.keys(vehicleUpdateData).length > 0) {
      await prisma.vehicle.update({
        where: { id: body.vehicleId },
        data: vehicleUpdateData,
      });
    }

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'FLEET_MANAGER',
      userEmail: body.requestingUserEmail || 'workshop@motalink.co.zw',
      action: 'CREATE',
      entityName: 'ServiceRecord',
      entityId: record.id,
      newData: record,
      depotId: vehicle.depotId,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
