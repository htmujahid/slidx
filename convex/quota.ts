import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import { requireUserId } from "./access"
import { resolveLimits } from "./limits"

export const DECK_LIMIT_ERROR = "LIMIT_REACHED:decks"

const DAY_MS = 24 * 60 * 60 * 1000

// Usage resets at 00:00 UTC; the day key is the number of days since epoch.
const dayOf = (now: number) => Math.floor(now / DAY_MS)
const resetAtOf = (day: number) => (day + 1) * DAY_MS

async function usageFor(ctx: QueryCtx | MutationCtx, userId: string) {
  return ctx.db
    .query("aiUsage")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique()
}

async function countDecks(ctx: QueryCtx | MutationCtx, userId: string) {
  const decks = await ctx.db
    .query("presentations")
    .withIndex("by_owner_updated", (q) => q.eq("ownerId", userId))
    .collect()
  return decks.length
}

export async function assertCanCreateDeck(ctx: MutationCtx, userId: string) {
  const limits = await resolveLimits(ctx, userId)
  if ((await countDecks(ctx, userId)) >= limits.decks) {
    throw new Error(DECK_LIMIT_ERROR)
  }
}

export const consumeAi = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const limits = await resolveLimits(ctx, userId)
    const now = Date.now()
    const day = dayOf(now)
    const usage = await usageFor(ctx, userId)
    const used = usage && usage.day === day ? usage.used : 0

    if (used >= limits.aiPerDay) {
      return { ok: false as const, resetAt: resetAtOf(day) }
    }
    if (usage) await ctx.db.patch(usage._id, { day, used: used + 1 })
    else await ctx.db.insert("aiUsage", { userId, day, used: 1 })
    return { ok: true as const, remaining: limits.aiPerDay - used - 1 }
  },
})

export const refundAi = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const usage = await usageFor(ctx, userId)
    if (usage && usage.day === dayOf(Date.now()) && usage.used > 0) {
      await ctx.db.patch(usage._id, { used: usage.used - 1 })
    }
  },
})

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const limits = await resolveLimits(ctx, userId)
    const day = dayOf(Date.now())
    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique()
    return {
      decks: { used: await countDecks(ctx, userId), limit: limits.decks },
      ai: {
        used: usage && usage.day === day ? usage.used : 0,
        limit: limits.aiPerDay,
        resetAt: resetAtOf(day),
      },
    }
  },
})
