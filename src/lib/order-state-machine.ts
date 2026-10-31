export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURN_REQUESTED'
  | 'EXCHANGED'
  | 'CANCELLED'
  | 'REFUNDED';

/**
 * Strict state machine for LEVIX streetwear order progression.
 * Protects against illegal transitions (e.g. CANCELLED -> DELIVERED, or REFUNDED -> SHIPPED).
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED', 'EXCHANGED'],
  RETURN_REQUESTED: ['EXCHANGED', 'REFUNDED', 'PROCESSING'],
  EXCHANGED: ['PROCESSING', 'SHIPPED'],
  CANCELLED: [], // Terminal state
  REFUNDED: [],  // Terminal state
};

/**
 * Validates if an order can move from current status to target status.
 */
export function canTransition(current: OrderStatus, target: OrderStatus): boolean {
  if (current === target) return true;
  const allowed = ALLOWED_ORDER_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Throws a descriptive error if the transition violates state rules.
 */
export function assertTransition(current: OrderStatus, target: OrderStatus): void {
  if (!canTransition(current, target)) {
    throw new Error(
      `Illegal order transition: cannot transition status from '${current}' to '${target}'. Allowed transitions: [${(
        ALLOWED_ORDER_TRANSITIONS[current] || []
      ).join(', ')}]`
    );
  }
}
