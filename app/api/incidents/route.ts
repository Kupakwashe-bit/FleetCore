import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        vehicle: true,
        driver: { include: { user: true } },
        rescueVehicle: true,
        trip: true,
      },
      orderBy: { reportedAt: 'desc' },
    });
    return NextResponse.json(incidents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const initialOwnership = [
      {
        timestamp: new Date().toISOString(),
        actor: body.reporterName || 'Driver Mobile Alert',
        action: 'Incident ticket logged in real-time dispatch control room',
      },
    ];

    const incident = await prisma.incident.create({
      data: {
        tripId: body.tripId || null,
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        incidentType: body.incidentType,
        severity: body.severity || 'MEDIUM',
        locationName: body.locationName,
        description: body.description,
        ownershipChainJson: JSON.stringify(initialOwnership),
        status: 'REPORTED',
      },
    });

    // Update vehicle status to MAINTENANCE
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { status: 'MAINTENANCE' },
    });

    await logAuditEvent({
      userId: body.requestingUserId || body.driverId,
      userRole: 'DRIVER',
      userEmail: 'incident.report@motalink.co.zw',
      action: 'CREATE',
      entityName: 'Incident',
      entityId: incident.id,
      newData: incident,
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
