import type { MutationCtx, QueryCtx } from "./_generated/server"

export type Limits = {
  decks: number
  aiPerDay: number
}

export const PLANS = {
  free: { decks: 3, aiPerDay: 10 },
} satisfies Record<string, Limits>

export type PlanId = keyof typeof PLANS

// The single place that decides what a user may do. When subscriptions are
// added, look up the user's plan (and any per-user override) here; nothing
// that enforces limits needs to change.
export async function resolveLimits(
  _ctx: QueryCtx | MutationCtx,
  _userId: string
): Promise<Limits> {
  return PLANS.free
}
