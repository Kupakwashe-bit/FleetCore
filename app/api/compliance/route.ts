import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const docs = await prisma.complianceDoc.findMany({
      include: {
        vehicle: true,
        driver: { include: { user: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });
    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doc = await prisma.complianceDoc.create({
      data: {
        vehicleId: body.vehicleId || null,
        driverId: body.driverId || null,
        docType: body.docType,
        documentNumber: body.documentNumber,
        issuingAuthority: body.issuingAuthority,
        issueDate: new Date(body.issueDate),
        expiryDate: new Date(body.expiryDate),
        status: body.status || 'VALID',
        costUSD: parseFloat(body.costUSD || 0),
        notes: body.notes,
      },
    });

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: 'FLEET_MANAGER',
      userEmail: 'compliance@motalink.co.zw',
      action: 'COMPLIANCE_RENEWAL',
      entityName: 'ComplianceDoc',
      entityId: doc.id,
      newData: doc,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
