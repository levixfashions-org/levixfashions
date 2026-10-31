import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const {
      name,
      slug,
      description,
      categoryId,
      fitType,
      fabric,
      gsm,
      careInstructions,
      modelInfo,
      isFeatured,
      isNewArrival,
      variants,
    } = body;

    const updated = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          categoryId,
          fitType,
          fabric,
          gsm: gsm ? Number(gsm) : undefined,
          careInstructions,
          modelInfo,
          isFeatured,
          isNewArrival,
        },
      });

      // Update variant stock and prices if supplied
      if (variants && Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                stock: Number(v.stock),
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              },
            });
          }
        }
      }

      return product;
    });

    // Record audit entry
    await logAdminAction({
      adminId: admin.id,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      metadata: { slug: updated.slug },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // Revalidate storefront cache
    try {
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath(`/product/${updated.slug}`);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update product drop' },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isRestore = searchParams.get('action') === 'restore';

    const product = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: isRestore ? null : new Date(),
      },
    });

    // Record audit entry
    await logAdminAction({
      adminId: admin.id,
      action: isRestore ? 'PRODUCT_RESTORED' : 'PRODUCT_DELETED',
      entity: 'Product',
      entityId: id,
      metadata: { isRestore, slug: product.slug },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // Revalidate paths
    try {
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath(`/product/${product.slug}`);
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      action: isRestore ? 'RESTORED' : 'ARCHIVED',
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to archive or restore product' },
      { status: error.status || 500 }
    );
  }
}
