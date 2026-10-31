import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { assertTransition, OrderStatus } from '@/lib/order-state-machine';
import { logAdminAction } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { orderNumber } = await params;

    let newStatus: OrderStatus;
    let courier: string | undefined;
    let trackingNumber: string | undefined;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      newStatus = body.newStatus;
      courier = body.courier;
      trackingNumber = body.trackingNumber;
    } else {
      // Standard form submission support
      const formData = await req.formData();
      newStatus = formData.get('newStatus') as OrderStatus;
      courier = (formData.get('courier') as string) || undefined;
      trackingNumber = (formData.get('trackingNumber') as string) || undefined;
    }

    if (!newStatus) {
      return NextResponse.json({ error: 'Missing new status parameter' }, { status: 400 });
    }

    // Fetch existing order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ENFORCE STRICT STATE TRANSITION MACHINE
    assertTransition(order.status as OrderStatus, newStatus);

    // Atomic transaction: status update + inventory restoration on cancellation
    const updatedOrder = await prisma.$transaction(async (tx: any) => {
      // If moving to CANCELLED, restore variant stocks
      if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return await tx.order.update({
        where: { orderNumber },
        data: {
          status: newStatus,
          trackingCourier: courier || order.trackingCourier,
          trackingNumber: trackingNumber || order.trackingNumber,
        },
      });
    });

    // Record Audit Entry
    await logAdminAction({
      adminId: admin.id,
      action: 'ORDER_STATUS_UPDATED',
      entity: 'Order',
      entityId: orderNumber,
      metadata: {
        from: order.status,
        to: newStatus,
        courier,
        trackingNumber,
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // If submitted via browser form, redirect back to order detail page
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL(`/admin/orders/${orderNumber}`, req.url));
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Order status transition error:', error);
    return NextResponse.json(
      { error: error.message || 'Illegal order transition' },
      { status: error.status || 400 }
    );
  }
}
