import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityName = searchParams.get('entityName');
    const action = searchParams.get('action');

    const where: any = {};
    if (entityName && entityName !== 'ALL') where.entityName = entityName;
    if (action && action !== 'ALL') where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
