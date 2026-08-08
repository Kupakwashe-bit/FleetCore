import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;
    const body = await request.json();

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const isResale = body.workflowType === 'RESOLD';
    const newStatus = isResale ? 'RESOLD' : 'DECOMMISSIONED';

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: newStatus,
        decommissionDate: new Date(),
        decommissionReason: body.reason || 'End of operational service life',
        resalePriceUSD: isResale ? parseFloat(body.resalePriceUSD || 0) : null,
        buyerName: isResale ? body.buyerName : null,
        decommissionNotes: body.notes,
        decommissionedByUserId: body.requestingUserId || null,
      },
    });

    // Log Immutable Audit Event
    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'ADMIN',
      userEmail: body.requestingUserEmail || 'admin@motalink.co.zw',
      action: isResale ? 'RESALE' : 'DECOMMISSION',
      entityName: 'Vehicle',
      entityId: vehicleId,
      oldData: { status: existingVehicle.status },
      newData: {
        status: newStatus,
        decommissionReason: updatedVehicle.decommissionReason,
        resalePriceUSD: updatedVehicle.resalePriceUSD,
        buyerName: updatedVehicle.buyerName,
      },
      depotId: existingVehicle.depotId,
    });

    return NextResponse.json(updatedVehicle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
