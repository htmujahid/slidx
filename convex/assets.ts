import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { ownedPresentation, requireUserId } from "./access"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const register = mutation({
  args: {
    storageId: v.id("_storage"),
    presentationId: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, presentationId }) => {
    const userId = await requireUserId(ctx)
    const metadata = await ctx.db.system.get("_storage", storageId)
    if (!metadata) throw new Error("The upload could not be found.")
    const owned = presentationId
      ? await ownedPresentation(ctx, presentationId)
      : null
    const assetId = await ctx.db.insert("assets", {
      ownerId: userId,
      presentationId: owned?.presentation._id,
      storageId,
      contentType: metadata.contentType ?? "application/octet-stream",
      size: metadata.size,
    })
    return String(assetId)
  },
})

export const url = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx)
    const assetId = ctx.db.normalizeId("assets", id)
    const asset = assetId ? await ctx.db.get(assetId) : null
    if (!asset || asset.ownerId !== userId) return null
    return await ctx.storage.getUrl(asset.storageId)
  },
})
