import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  FREE_SHIPPING_THRESHOLD_PAISE,
  STANDARD_SHIPPING_FEE_PAISE,
} from '../src/lib/totals';

describe('Shared Totals & Indian GST Engine (HSN 6109)', () => {
  it('charges standard ₹99 shipping when cart is below the ₹999 threshold', () => {
    // 1 garment at ₹899 (89900 paise)
    const items = [{ pricePaise: 89900, quantity: 1 }];
    const totals = calculateTotals(items);

    expect(totals.subtotalPaise).toBe(89900);
    expect(totals.isFreeShipping).toBe(false);
    expect(totals.shippingPaise).toBe(STANDARD_SHIPPING_FEE_PAISE); // 9900 paise (₹99)
    expect(totals.totalPaise).toBe(89900 + 9900); // 99800 paise (₹998)
    expect(Number.isInteger(totals.totalPaise)).toBe(true);
  });

  it('grants FREE shipping when cart meets or exceeds ₹999 threshold', () => {
    // 1 oversized tee at ₹1,799 (179900 paise)
    const items = [{ pricePaise: 179900, quantity: 1 }];
    const totals = calculateTotals(items);

    expect(totals.subtotalPaise).toBe(179900);
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.shippingPaise).toBe(0);
    expect(totals.totalPaise).toBe(179900);
  });

  it('accurately computes 12% Indian GST extraction under HSN 6109', () => {
    // ₹1,120 total includes ₹120 GST (at 12%)
    const items = [{ pricePaise: 112000, quantity: 1 }];
    const totals = calculateTotals(items);

    // GST = 112000 - (112000 / 1.12) = 12000 paise (₹120)
    expect(totals.gstPaise).toBe(12000);
  });

  it('correctly applies a percentage coupon (10% off with WELCOME10)', () => {
    const items = [{ pricePaise: 200000, quantity: 1 }]; // ₹2,000
    const coupon = {
      code: 'WELCOME10',
      discountType: 'PERCENT' as const,
      discountValue: 10,
      isActive: true,
    };

    const totals = calculateTotals(items, coupon);
    expect(totals.subtotalPaise).toBe(200000);
    expect(totals.discountPaise).toBe(20000); // ₹200 off
    expect(totals.totalPaise).toBe(180000); // ₹1,800 final
  });

  it('correctly applies a flat discount coupon (FLAT500 = ₹500 off)', () => {
    const items = [{ pricePaise: 349900, quantity: 1 }]; // ₹3,499
    const coupon = {
      code: 'FLAT500',
      discountType: 'FIXED_PAISE' as const,
      discountValue: 50000, // 50000 paise = ₹500
      minOrderPaise: 249900,
      isActive: true,
    };

    const totals = calculateTotals(items, coupon);
    expect(totals.discountPaise).toBe(50000);
    expect(totals.totalPaise).toBe(349900 - 50000); // ₹2,999
  });

  it('rejects an expired coupon without applying discount', () => {
    const items = [{ pricePaise: 200000, quantity: 1 }];
    const coupon = {
      code: 'EXPIRED15',
      discountType: 'PERCENT' as const,
      discountValue: 15,
      expiresAt: new Date(Date.now() - 3600000 * 24), // Expired yesterday
      isActive: true,
    };

    const totals = calculateTotals(items, coupon);
    expect(totals.discountPaise).toBe(0);
    expect(totals.couponError).toMatch(/has expired/);
    expect(totals.totalPaise).toBe(200000);
  });

  it('rejects a coupon if cart is below the minimum order requirement', () => {
    const items = [{ pricePaise: 129900, quantity: 1 }]; // ₹1,299
    const coupon = {
      code: 'LEVIX15',
      discountType: 'PERCENT' as const,
      discountValue: 15,
      minOrderPaise: 249900, // Requires ₹2,499
      isActive: true,
    };

    const totals = calculateTotals(items, coupon);
    expect(totals.discountPaise).toBe(0);
    expect(totals.couponError).toMatch(/requires a minimum order of ₹2499/);
  });

  it('handles empty carts safely with 0 paise everywhere', () => {
    const totals = calculateTotals([]);
    expect(totals.subtotalPaise).toBe(0);
    expect(totals.shippingPaise).toBe(0);
    expect(totals.totalPaise).toBe(0);
    expect(totals.gstPaise).toBe(0);
  });
});
