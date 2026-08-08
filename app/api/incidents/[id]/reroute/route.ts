import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const incidentId = params.id;
    const body = await request.json();

    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident ticket not found' }, { status: 404 });
    }

    const currentChain = JSON.parse(incident.ownershipChainJson || '[]');
    currentChain.push({
      timestamp: new Date().toISOString(),
      actor: body.actorName || 'Dispatcher',
      action: `Assigned rescue vehicle ${body.rescueVehicleReg || body.rescueVehicleId} and rerouted cargo transshipment.`,
    });

    const updatedIncident = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        rescueVehicleId: body.rescueVehicleId,
        status: 'RESCUE_DISPATCHED',
        ownershipChainJson: JSON.stringify(currentChain),
        resolutionNotes: body.notes || 'Rescue vehicle dispatched to scene.',
      },
    });

    // Mark rescue vehicle as DISPATCHED
    if (body.rescueVehicleId) {
      await prisma.vehicle.update({
        where: { id: body.rescueVehicleId },
        data: { status: 'DISPATCHED' },
      });
    }

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'DISPATCHER',
      userEmail: body.requestingUserEmail || 'dispatch@motalink.co.zw',
      action: 'REROUTE',
      entityName: 'Incident',
      entityId: incidentId,
      oldData: { status: incident.status },
      newData: { status: updatedIncident.status, rescueVehicleId: body.rescueVehicleId },
    });

    return NextResponse.json(updatedIncident);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
