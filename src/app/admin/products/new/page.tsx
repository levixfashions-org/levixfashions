import React from 'react';
import ProductMatrixForm from '@/components/admin/ProductMatrixForm';
import AdminHeader from '@/components/admin/AdminHeader';

export default function NewProductDropPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="New Garment Drop Matrix"
        subtitle="Configure oversized silhouette, define colorways, and populate size matrix"
      />
      <ProductMatrixForm isEditMode={false} />
    </div>
  );
}
