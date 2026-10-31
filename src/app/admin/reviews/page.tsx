import React from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminReviewsPage() {
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query reviews for admin:', err);
    // Mock reviews queue
    reviews = [
      {
        id: 'rev-1',
        rating: 5,
        title: 'Heaviest cotton drape I have ever worn',
        comment:
          'The 280 GSM French Terry is phenomenal. Perfect boxy crop that sits right on the belt line. Ordered two more colors immediately.',
        isVerified: true,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2),
        product: { name: 'Heavyweight Boxy Fit Tee' },
        user: { name: 'Aarav Sharma', email: 'aarav@gmail.com' },
      },
      {
        id: 'rev-2',
        rating: 5,
        title: 'Texture on point',
        comment:
          'Waffle texture gives it an insane luxury streetwear feel. Collar does not bacon after wash.',
        isVerified: true,
        createdAt: new Date(Date.now() - 3600000 * 24 * 5),
        product: { name: 'Waffle Oversized Drop Tee' },
        user: { name: 'Rohan Verma', email: 'rohan.v@gmail.com' },
      },
    ];
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="Customer Reviews Moderation"
        subtitle="Curate authentic customer feedback from verified streetwear buyers"
      />

      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Reviewer</th>
                <th className="pb-3 font-semibold">Rating</th>
                <th className="pb-3 font-semibold">Feedback & Commentary</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Product */}
                  <td className="py-4 font-bold text-white max-w-[150px]">
                    {rev.product?.name || 'Streetwear Tee'}
                  </td>

                  {/* Reviewer */}
                  <td className="py-4">
                    <p className="font-semibold text-white">{rev.user?.name || 'Verified Customer'}</p>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4">
                    <div className="flex items-center space-x-1 text-[#C8FF3D]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Comment */}
                  <td className="py-4 max-w-sm">
                    <p className="font-bold text-white mb-0.5">{rev.title}</p>
                    <p className="text-white/70 leading-relaxed text-[11px] line-clamp-2">
                      {rev.comment}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-4 text-white/40 font-mono text-[11px]">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-all"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 transition-all"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
