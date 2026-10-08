import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const depots = await prisma.depot.findMany({
      include: {
        _count: {
          select: {
            vehicles: true,
            drivers: true,
            trips: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(depots);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.code || !body.name || !body.city) {
      return NextResponse.json({ error: 'Code, Name, and City are required' }, { status: 400 });
    }

    const depot = await prisma.depot.create({
      data: {
        code: body.code.toUpperCase().trim(),
        name: body.name.trim(),
        city: body.city.trim(),
        address: body.address || '',
        contactPhone: body.contactPhone || '',
      },
    });

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'ADMIN',
      userEmail: body.requestingUserEmail || 'admin@motalink.co.zw',
      action: 'CREATE',
      entityName: 'Depot',
      entityId: depot.id,
      newData: depot,
      depotId: depot.id,
    });

    return NextResponse.json(depot, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
