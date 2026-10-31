export interface CartItemInput {
  pricePaise: number;
  quantity: number;
  stock?: number;
}

export interface CouponInput {
  code: string;
  discountType: 'PERCENT' | 'FIXED_PAISE';
  discountValue: number; // e.g. 10 for 10%, or 50000 for 50000 paise (₹500)
  minOrderPaise?: number; // e.g. 99900 for ₹999
  expiresAt?: Date | string | null;
  isActive?: boolean;
}

export interface TotalsBreakdown {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  gstPaise: number; // 12% Indian GST (HSN 6109)
  totalPaise: number;
  isFreeShipping: boolean;
  couponError?: string;
}

export const FREE_SHIPPING_THRESHOLD_PAISE = 99900; // ₹999 in integer paise
export const STANDARD_SHIPPING_FEE_PAISE = 9900; // ₹99 in integer paise
export const GST_RATE = 0.12; // 12% Indian GST on apparel (HSN 6109)

/**
 * Authoritative totals calculation engine for LEVIX.
 * Shared between client cart and server-side checkout to prevent tampering.
 */
export function calculateTotals(
  items: CartItemInput[],
  coupon?: CouponInput | null
): TotalsBreakdown {
  // 1. Calculate raw subtotal
  const subtotalPaise = items.reduce((acc, item) => {
    const qty = Math.max(0, Math.floor(item.quantity));
    return acc + Math.round(item.pricePaise) * qty;
  }, 0);

  // 2. Validate and apply coupon
  let discountPaise = 0;
  let couponError: string | undefined;

  if (coupon) {
    const now = new Date();
    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
    const isBelowMin = coupon.minOrderPaise && subtotalPaise < coupon.minOrderPaise;

    if (coupon.isActive === false) {
      couponError = `Coupon '${coupon.code}' is no longer active.`;
    } else if (isExpired) {
      couponError = `Coupon '${coupon.code}' has expired.`;
    } else if (isBelowMin) {
      const minRupees = Math.round((coupon.minOrderPaise || 0) / 100);
      couponError = `Coupon '${coupon.code}' requires a minimum order of ₹${minRupees}.`;
    } else {
      if (coupon.discountType === 'PERCENT') {
        const pct = Math.min(100, Math.max(0, coupon.discountValue));
        discountPaise = Math.round((subtotalPaise * pct) / 100);
      } else if (coupon.discountType === 'FIXED_PAISE') {
        discountPaise = Math.min(subtotalPaise, Math.round(coupon.discountValue));
      }
    }
  }

  const taxableSubtotal = Math.max(0, subtotalPaise - discountPaise);

  // 3. Shipping Fee calculation (Free shipping above ₹999)
  const isFreeShipping = taxableSubtotal >= FREE_SHIPPING_THRESHOLD_PAISE || subtotalPaise === 0;
  const shippingPaise = subtotalPaise === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE_PAISE;

  // 4. Indian GST calculation (12% included / computed per HSN 6109)
  // GST amount = Taxable Subtotal - (Taxable Subtotal / 1.12)
  const gstPaise = taxableSubtotal > 0
    ? Math.round(taxableSubtotal - taxableSubtotal / (1 + GST_RATE))
    : 0;

  // 5. Grand Total (all inclusive)
  const totalPaise = taxableSubtotal + shippingPaise;

  return {
    subtotalPaise,
    discountPaise,
    shippingPaise,
    gstPaise,
    totalPaise,
    isFreeShipping,
    couponError,
  };
}
