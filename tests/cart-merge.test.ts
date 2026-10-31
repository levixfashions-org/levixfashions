import { describe, it, expect } from 'vitest';

interface CartItem {
  variantId: string;
  quantity: number;
  pricePaise: number;
}

interface DbVariant {
  id: string;
  pricePaise: number;
  stock: number;
}

/**
 * Pure cart merge function that syncs guest localStorage items with authenticated database items.
 * Validates authoritative stock and updates prices against DB truth.
 */
function mergeCarts(
  guestItems: CartItem[],
  dbItems: CartItem[],
  liveVariants: Record<string, DbVariant>
): { mergedItems: CartItem[]; outOfStockVariantIds: string[] } {
  const itemMap = new Map<string, CartItem>();
  const outOfStockVariantIds: string[] = [];

  // 1. Seed with existing DB items
  for (const item of dbItems) {
    const live = liveVariants[item.variantId];
    if (live && live.stock > 0) {
      itemMap.set(item.variantId, {
        variantId: item.variantId,
        quantity: Math.min(item.quantity, live.stock),
        pricePaise: live.pricePaise, // Enforce DB authoritative price
      });
    }
  }

  // 2. Merge guest items
  for (const guestItem of guestItems) {
    const live = liveVariants[guestItem.variantId];

    if (!live || live.stock <= 0) {
      outOfStockVariantIds.push(guestItem.variantId);
      continue;
    }

    const existing = itemMap.get(guestItem.variantId);
    if (existing) {
      // Combine quantities capped at available live warehouse stock
      const newQty = Math.min(existing.quantity + guestItem.quantity, live.stock);
      existing.quantity = newQty;
      existing.pricePaise = live.pricePaise;
    } else {
      itemMap.set(guestItem.variantId, {
        variantId: guestItem.variantId,
        quantity: Math.min(guestItem.quantity, live.stock),
        pricePaise: live.pricePaise,
      });
    }
  }

  return {
    mergedItems: Array.from(itemMap.values()),
    outOfStockVariantIds,
  };
}

describe('Guest-to-Account Cart Merging & Stock Revalidation', () => {
  const mockLiveVariants: Record<string, DbVariant> = {
    'var-waffle-m': { id: 'var-waffle-m', pricePaise: 179900, stock: 20 },
    'var-boxy-l': { id: 'var-boxy-l', pricePaise: 189900, stock: 5 },
    'var-acid-xl': { id: 'var-acid-xl', pricePaise: 199900, stock: 0 }, // Out of stock
  };

  it('merges new guest items into an empty user cart and overrides with authoritative DB prices', () => {
    const guestCart = [
      { variantId: 'var-waffle-m', quantity: 2, pricePaise: 99900 }, // Client attempted fake price of ₹999
    ];
    const dbCart: CartItem[] = [];

    const { mergedItems } = mergeCarts(guestCart, dbCart, mockLiveVariants);

    expect(mergedItems.length).toBe(1);
    expect(mergedItems[0].variantId).toBe('var-waffle-m');
    expect(mergedItems[0].quantity).toBe(2);
    // Verifies client price tampering was thwarted: reset to 179900 paise
    expect(mergedItems[0].pricePaise).toBe(179900);
  });

  it('combines quantities when the same variant exists in both guest and DB carts', () => {
    const guestCart = [{ variantId: 'var-waffle-m', quantity: 1, pricePaise: 179900 }];
    const dbCart = [{ variantId: 'var-waffle-m', quantity: 2, pricePaise: 179900 }];

    const { mergedItems } = mergeCarts(guestCart, dbCart, mockLiveVariants);

    expect(mergedItems.length).toBe(1);
    expect(mergedItems[0].quantity).toBe(3); // 1 + 2 = 3
  });

  it('caps merged quantity at available warehouse stock to prevent overselling', () => {
    // Only 5 units in stock for var-boxy-l
    const guestCart = [{ variantId: 'var-boxy-l', quantity: 4, pricePaise: 189900 }];
    const dbCart = [{ variantId: 'var-boxy-l', quantity: 3, pricePaise: 189900 }];

    const { mergedItems } = mergeCarts(guestCart, dbCart, mockLiveVariants);

    expect(mergedItems.length).toBe(1);
    expect(mergedItems[0].quantity).toBe(5); // Capped at live.stock = 5
  });

  it('detects and flags variants that dropped to zero stock while guest was browsing', () => {
    const guestCart = [{ variantId: 'var-acid-xl', quantity: 1, pricePaise: 199900 }];
    const dbCart: CartItem[] = [];

    const { mergedItems, outOfStockVariantIds } = mergeCarts(guestCart, dbCart, mockLiveVariants);

    expect(mergedItems.length).toBe(0);
    expect(outOfStockVariantIds).toContain('var-acid-xl');
  });
});
