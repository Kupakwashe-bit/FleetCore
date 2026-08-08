import { prisma } from './prisma';

export interface AuditParams {
  userId: string;
  userRole: string;
  userEmail: string;
  action: string; // e.g. 'CREATE', 'UPDATE', 'DECOMMISSION', 'RESALE', 'SYNC', 'REROUTE', 'COMPLIANCE_RENEWAL'
  entityName: string; // e.g. 'Vehicle', 'Trip', 'ComplianceDoc', 'Incident', 'FraudAlert'
  entityId: string;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  ipAddress?: string;
  depotId?: string;
}

export async function logAuditEvent(params: AuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userRole: params.userRole,
        userEmail: params.userEmail,
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId,
        oldDataJson: params.oldData ? JSON.stringify(params.oldData) : null,
        newDataJson: params.newData ? JSON.stringify(params.newData) : null,
        ipAddress: params.ipAddress || '127.0.0.1',
        depotId: params.depotId || null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Audit failure shouldn't break main transaction, but must log to stderr in production
  }
}
