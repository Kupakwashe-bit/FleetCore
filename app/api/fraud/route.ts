import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const alerts = await prisma.fraudAlert.findMany({
      include: {
        vehicle: true,
        driver: { include: { user: true } },
        trip: true,
        reviewedByUser: { select: { name: true, email: true } },
      },
      orderBy: { flaggedAt: 'desc' },
    });
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alertId, status, reviewNotes, requestingUserId, requestingUserEmail } = body;

    const alert = await prisma.fraudAlert.update({
      where: { id: alertId },
      data: {
        status,
        reviewNotes,
        reviewedByUserId: requestingUserId || null,
      },
    });

    await logAuditEvent({
      userId: requestingUserId || 'auditor',
      userRole: 'AUDITOR',
      userEmail: requestingUserEmail || 'auditor@motalink.co.zw',
      action: 'UPDATE',
      entityName: 'FraudAlert',
      entityId: alertId,
      newData: { status, reviewNotes },
    });

    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
