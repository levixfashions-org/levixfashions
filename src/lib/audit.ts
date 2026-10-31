import prisma from './prisma';

export interface AdminAuditParams {
  adminId: string;
  action:
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_DELETED'
    | 'PRODUCT_RESTORED'
    | 'ORDER_STATUS_UPDATED'
    | 'ORDER_TRACKING_UPDATED'
    | 'ORDER_REFUNDED'
    | 'EXCHANGE_APPROVED'
    | 'EXCHANGE_REJECTED'
    | 'CUSTOMER_BLOCKED'
    | 'CUSTOMER_UNBLOCKED'
    | 'COUPON_CREATED'
    | 'COUPON_DELETED'
    | 'SETTINGS_UPDATED';
  entity: 'Product' | 'Order' | 'User' | 'Coupon' | 'Setting' | 'Exchange';
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Persists an immutable administrative action log entry to the MySQL database.
 */
export async function logAdminAction(params: AdminAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR] Failed to record administrative audit entry:', error);
    // Non-blocking for primary transaction flow, but alerts system monitors
    return null;
  }
}
