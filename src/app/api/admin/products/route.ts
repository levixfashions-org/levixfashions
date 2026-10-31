import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('category');

    const where: any = { deletedAt: null };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { variants: { some: { sku: { contains: q } } } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
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
      variants = [],
      images = [],
    } = body;

    if (!name || !slug || !variants.length) {
      return NextResponse.json(
        { error: 'Missing required garment fields or variant matrix' },
        { status: 400 }
      );
    }

    // Atomic transaction: create product, matrix variants, and lookbook images
    const createdProduct = await prisma.$transaction(async (tx: any) => {
      // 1. Create base product
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          categoryId,
          fitType: fitType || 'OVERSIZED',
          fabric: fabric || '100% French Terry Cotton',
          gsm: Number(gsm) || 280,
          careInstructions,
          modelInfo,
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
        },
      });

      // 2. Create all matrix variants (Color x Size)
      for (const v of variants) {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            sku: v.sku,
            price: Number(v.price), // In integer paise
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            stock: Number(v.stock),
          },
        });
      }

      // 3. Attach lookbook images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            colorName: img.colorName || null,
            isPrimary: img.isPrimary ?? (i === 0),
            sortOrder: i,
          },
        });
      }

      return product;
    });

    // 4. Log to Audit Trail
    await logAdminAction({
      adminId: admin.id,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: createdProduct.id,
      metadata: { slug: createdProduct.slug, variantsCount: variants.length },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // 5. On-Demand ISR Revalidation for instant storefront updates
    try {
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath(`/product/${slug}`);
    } catch {
      // Non-blocking in non-Next runtime
    }

    return NextResponse.json({ success: true, product: createdProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create product drop:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product drop' },
      { status: error.status || 500 }
    );
  }
}
