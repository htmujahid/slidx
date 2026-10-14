import type { Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { authComponent } from "./auth"

export const MAX_SLIDE_BYTES = 900_000

export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.getAuthUser(ctx)
  return String(user._id)
}

export async function ownedPresentation(
  ctx: QueryCtx | MutationCtx,
  id: string
) {
  const userId = await requireUserId(ctx)
  const presentationId = ctx.db.normalizeId("presentations", id)
  const presentation = presentationId ? await ctx.db.get(presentationId) : null
  return presentation && presentation.ownerId === userId
    ? { userId, presentation }
    : null
}

export function assertSlideSize(json: string) {
  if (new TextEncoder().encode(json).length > MAX_SLIDE_BYTES) {
    throw new Error("This slide is too large to save.")
  }
}

export type PresentationId = Id<"presentations">
