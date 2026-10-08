import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get('depotId');
    const status = searchParams.get('status');

    const where: any = {};
    if (depotId && depotId !== 'ALL') where.depotId = depotId;
    if (status && status !== 'ALL') where.status = status;

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        depot: true,
        trips: {
          where: { status: 'EN_ROUTE' },
          select: { id: true, tripCode: true, destinationName: true, status: true },
          take: 1,
        },
        complianceDocs: {
          select: { id: true, docType: true, documentNumber: true, expiryDate: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(drivers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if user already exists, or create a new user for the driver
    let userId = body.userId;
    if (!userId) {
      if (!body.email || !body.name) {
        return NextResponse.json({ error: 'Name and email are required to create driver profile' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const passwordHash = await bcrypt.hash(body.password || 'password123', 10);
        const newUser = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            passwordHash,
            role: 'DRIVER',
            depotId: body.depotId,
          },
        });
        userId = newUser.id;
      }
    }

    const driver = await prisma.driver.create({
      data: {
        userId,
        licenseNumber: body.licenseNumber,
        licenseClasses: body.licenseClasses || 'Class 1 Heavy',
        licenseExpiry: new Date(body.licenseExpiry),
        medicalCertExpiry: new Date(body.medicalCertExpiry),
        status: body.status || 'AVAILABLE',
        depotId: body.depotId,
        safetyRating: parseFloat(body.safetyRating || 5.0),
        efficiencyRating: parseFloat(body.efficiencyRating || 5.0),
        punctualityRating: parseFloat(body.punctualityRating || 5.0),
      },
      include: {
        user: { select: { name: true, email: true } },
        depot: true,
      },
    });

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'FLEET_MANAGER',
      userEmail: body.requestingUserEmail || 'fleet.mgr@motalink.co.zw',
      action: 'CREATE',
      entityName: 'Driver',
      entityId: driver.id,
      newData: driver,
      depotId: driver.depotId,
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { driverId, ...updateData } = body;

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID is required for update' }, { status: 400 });
    }

    const oldDriver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!oldDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const data: any = {};
    if (updateData.status) data.status = updateData.status;
    if (updateData.depotId) data.depotId = updateData.depotId;
    if (updateData.licenseClasses) data.licenseClasses = updateData.licenseClasses;
    if (updateData.licenseExpiry) data.licenseExpiry = new Date(updateData.licenseExpiry);
    if (updateData.medicalCertExpiry) data.medicalCertExpiry = new Date(updateData.medicalCertExpiry);
    if (updateData.safetyRating !== undefined) data.safetyRating = parseFloat(updateData.safetyRating);
    if (updateData.efficiencyRating !== undefined) data.efficiencyRating = parseFloat(updateData.efficiencyRating);
    if (updateData.punctualityRating !== undefined) data.punctualityRating = parseFloat(updateData.punctualityRating);

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data,
      include: { user: true, depot: true },
    });

    await logAuditEvent({
      userId: body.requestingUserId || 'system',
      userRole: body.requestingUserRole || 'FLEET_MANAGER',
      userEmail: body.requestingUserEmail || 'fleet.mgr@motalink.co.zw',
      action: 'UPDATE',
      entityName: 'Driver',
      entityId: updatedDriver.id,
      oldData: oldDriver,
      newData: updatedDriver,
      depotId: updatedDriver.depotId,
    });

    return NextResponse.json(updatedDriver);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
