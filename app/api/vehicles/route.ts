import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get('depotId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (depotId && depotId !== 'ALL') where.depotId = depotId;
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        depot: true,
        decommissionedByUser: { select: { name: true, email: true } },
        _count: { select: { trips: true, serviceRecords: true, complianceDocs: true, incidents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vehicle = await prisma.vehicle.create({
      data: {
        vin: body.vin,
        registrationNumber: body.registrationNumber,
        category: body.category,
        make: body.make,
        model: body.model,
        year: parseInt(body.year),
        payloadCapacityKg: parseFloat(body.payloadCapacityKg || 0),
        passengerCapacity: parseInt(body.passengerCapacity || 0),
        fuelType: body.fuelType || 'DIESEL',
        odometerKm: parseFloat(body.odometerKm || 0),
        depotId: body.depotId,
        status: 'ACTIVE',
      },
    });

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'ADMIN',
      userEmail: body.requestingUserEmail || 'admin@motalink.co.zw',
      action: 'CREATE',
      entityName: 'Vehicle',
      entityId: vehicle.id,
      newData: vehicle,
      depotId: vehicle.depotId,
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
