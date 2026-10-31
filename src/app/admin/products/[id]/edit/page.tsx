import React from 'react';
import prisma from '@/lib/prisma';
import ProductMatrixForm from '@/components/admin/ProductMatrixForm';
import AdminHeader from '@/components/admin/AdminHeader';
import { notFound } from 'next/navigation';

export default async function EditProductDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
  } catch (err) {
    console.error('Failed to load product for editing:', err);
  }

  if (!product) {
    // Provide a baseline placeholder if testing without db records
    product = {
      id,
      name: 'Heavyweight Boxy Fit Tee',
      slug: 'heavyweight-boxy-fit-tee',
      description: 'Structured French Terry cotton with dropped shoulders.',
      categoryId: 'boxy-fit',
      fitType: 'BOXY',
      fabric: '100% Combed Ringspun French Terry',
      gsm: 280,
      careInstructions: 'Machine wash cold inside out.',
      modelInfo: 'Model is 6’1” wearing size L.',
      isFeatured: true,
      isNewArrival: true,
      colors: [
        { id: 'c1', name: 'Mineral Washed Charcoal', hex: '#2A2A2E' },
        { id: 'c2', name: 'Chalk White', hex: '#EAE6DF' },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
          colorName: 'Mineral Washed Charcoal',
          isPrimary: true,
        },
      ],
    };
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Edit Drop: ${product.name}`}
        subtitle="Modify variants, restock sizes, update pricing and photography"
      />
      <ProductMatrixForm initialData={product} isEditMode={true} />
    </div>
  );
}
