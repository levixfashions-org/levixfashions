import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;

    const customer = await prisma.user.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const nextStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
    });

    // Record in Audit Trail
    await logAdminAction({
      adminId: admin.id,
      action: nextStatus === 'BLOCKED' ? 'CUSTOMER_BLOCKED' : 'CUSTOMER_UNBLOCKED',
      entity: 'User',
      entityId: id,
      metadata: { email: customer.email, newStatus: nextStatus },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const referer = req.headers.get('referer');
    if (referer && referer.includes('/admin/customers')) {
      return NextResponse.redirect(new URL('/admin/customers', req.url));
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized action' },
      { status: error.status || 500 }
    );
  }
}
