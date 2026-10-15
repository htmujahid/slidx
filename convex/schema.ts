import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  presentations: defineTable({
    ownerId: v.string(),
    title: v.string(),
    slideCount: v.number(),
    updatedAt: v.number(),
  }).index("by_owner_updated", ["ownerId", "updatedAt"]),
  slides: defineTable({
    presentationId: v.id("presentations"),
    key: v.string(),
    order: v.number(),
    json: v.string(),
  })
    .index("by_presentation_order", ["presentationId", "order"])
    .index("by_presentation_key", ["presentationId", "key"]),
  aiUsage: defineTable({
    userId: v.string(),
    day: v.number(),
    used: v.number(),
  }).index("by_user", ["userId"]),
  assets: defineTable({
    ownerId: v.string(),
    presentationId: v.optional(v.id("presentations")),
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
  }).index("by_presentation", ["presentationId"]),
})
