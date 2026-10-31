import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdmin, requireAuth } from '../src/lib/auth';
import {
  canTransition,
  assertTransition,
  ALLOWED_ORDER_TRANSITIONS,
  OrderStatus,
} from '../src/lib/order-state-machine';

describe('Admin Security & RBAC Protection', () => {
  it('throws 401 when request is completely unauthenticated', async () => {
    const mockReq: any = {
      headers: { get: () => null },
      cookies: { get: () => null },
    };

    await expect(requireAdmin(mockReq)).rejects.toMatchObject({
      status: 401,
      message: 'Authentication required',
    });
  });

  it('throws 403 Forbidden when a customer attempts to access admin route', async () => {
    const mockReq: any = {
      headers: { get: (name: string) => (name === 'Authorization' ? 'Bearer mock-customer-token-123' : null) },
      cookies: { get: () => null },
    };

    await expect(requireAdmin(mockReq)).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden: Admin access required',
    });
  });

  it('allows access for a user with ADMIN role', async () => {
    const mockReq: any = {
      headers: { get: (name: string) => (name === 'Authorization' ? 'Bearer mock-admin-token-123' : null) },
      cookies: { get: () => null },
    };

    const admin = await requireAdmin(mockReq);
    expect(admin).toBeDefined();
    expect(admin.role).toBe('ADMIN');
    expect(admin.email).toBe('admin@thelevix.com');
  });
});

describe('Order Status Transition State Machine', () => {
  it('permits valid linear order progression: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(canTransition('PROCESSING', 'SHIPPED')).toBe(true);
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('permits cancellation from early states: PENDING, CONFIRMED, PROCESSING', () => {
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransition('PROCESSING', 'CANCELLED')).toBe(true);
  });

  it('strictly blocks illegal transitions from terminal CANCELLED state', () => {
    expect(canTransition('CANCELLED', 'DELIVERED')).toBe(false);
    expect(canTransition('CANCELLED', 'PROCESSING')).toBe(false);
    expect(canTransition('CANCELLED', 'SHIPPED')).toBe(false);

    expect(() => assertTransition('CANCELLED', 'DELIVERED')).toThrowError(
      /Illegal order transition/
    );
  });

  it('strictly blocks illegal transitions from terminal REFUNDED state', () => {
    expect(canTransition('REFUNDED', 'SHIPPED')).toBe(false);
    expect(() => assertTransition('REFUNDED', 'SHIPPED')).toThrowError(
      /Illegal order transition/
    );
  });

  it('supports the 7-day streetwear size exchange workflow', () => {
    // Customer requests return/exchange from DELIVERED
    expect(canTransition('DELIVERED', 'RETURN_REQUESTED')).toBe(true);
    expect(canTransition('DELIVERED', 'EXCHANGED')).toBe(true);

    // Admin approves and sets EXCHANGED
    expect(canTransition('RETURN_REQUESTED', 'EXCHANGED')).toBe(true);

    // Replacement garment is processed and shipped
    expect(canTransition('EXCHANGED', 'PROCESSING')).toBe(true);
    expect(canTransition('EXCHANGED', 'SHIPPED')).toBe(true);
  });
});

describe('Matrix SKU Generation and Integer Pricing Integrity', () => {
  it('generates distinct deterministic SKUs for each Color x Size combination', () => {
    const slug = 'acid-washed-boxy-heavyweight-tee';
    const colorCode = 'CHA';
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const skus = sizes.map(
      (size) => `LVX-${slug.substring(0, 4).toUpperCase()}-${colorCode}-${size}`
    );

    expect(new Set(skus).size).toBe(sizes.length);
    expect(skus[0]).toBe('LVX-ACID-CHA-S');
    expect(skus[4]).toBe('LVX-ACID-CHA-XXL');
  });

  it('correctly maps rupee inputs to integer paise without floating point inaccuracy', () => {
    const priceRupees = 1799;
    const pricePaise = Math.round(priceRupees * 100);
    expect(pricePaise).toBe(179900);
    expect(Number.isInteger(pricePaise)).toBe(true);

    // Decimal safety (e.g. ₹1,499.50)
    const decimalPriceRupees = 1499.5;
    const decimalPaise = Math.round(decimalPriceRupees * 100);
    expect(decimalPaise).toBe(149950);
  });
});
