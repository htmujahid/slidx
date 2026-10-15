import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { assertSlideSize, ownedPresentation, requireUserId } from "./access"
import { assertCanCreateDeck } from "./quota"

const slideInput = v.object({ id: v.string(), json: v.string() })

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const presentations = await ctx.db
      .query("presentations")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect()
    return presentations.map(({ _id, title, slideCount, updatedAt }) => ({
      id: String(_id),
      title,
      slideCount,
      updatedAt,
    }))
  },
})

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const owned = await ownedPresentation(ctx, id)
    if (!owned) return null
    const slides = await ctx.db
      .query("slides")
      .withIndex("by_presentation_order", (q) =>
        q.eq("presentationId", owned.presentation._id)
      )
      .collect()
    return {
      id: String(owned.presentation._id),
      title: owned.presentation.title,
      slides: slides.map(({ key, json }) => ({ id: key, json })),
    }
  },
})

export const create = mutation({
  args: { title: v.string(), slides: v.array(slideInput) },
  handler: async (ctx, { title, slides }) => {
    const userId = await requireUserId(ctx)
    await assertCanCreateDeck(ctx, userId)
    slides.forEach(({ json }) => assertSlideSize(json))
    const presentationId = await ctx.db.insert("presentations", {
      ownerId: userId,
      title,
      slideCount: slides.length,
      updatedAt: Date.now(),
    })
    for (const [order, { id, json }] of slides.entries()) {
      await ctx.db.insert("slides", {
        presentationId,
        key: id,
        order,
        json,
      })
    }
    return String(presentationId)
  },
})

export const save = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    order: v.array(v.string()),
    changed: v.array(slideInput),
  },
  handler: async (ctx, { id, title, order, changed }) => {
    const owned = await ownedPresentation(ctx, id)
    if (!owned) throw new Error("Presentation not found.")
    const presentationId = owned.presentation._id
    changed.forEach(({ json }) => assertSlideSize(json))

    const existing = await ctx.db
      .query("slides")
      .withIndex("by_presentation_order", (q) =>
        q.eq("presentationId", presentationId)
      )
      .collect()
    const byKey = new Map(existing.map((slide) => [slide.key, slide]))
    const jsonByKey = new Map(changed.map(({ id, json }) => [id, json]))
    const keep = new Set(order)

    for (const slide of existing) {
      if (!keep.has(slide.key)) await ctx.db.delete(slide._id)
    }
    for (const [index, key] of order.entries()) {
      const slide = byKey.get(key)
      const json = jsonByKey.get(key)
      if (slide) {
        const patch: { order?: number; json?: string } = {}
        if (slide.order !== index) patch.order = index
        if (json !== undefined && json !== slide.json) patch.json = json
        if (patch.order !== undefined || patch.json !== undefined) {
          await ctx.db.patch(slide._id, patch)
        }
      } else if (json !== undefined) {
        await ctx.db.insert("slides", {
          presentationId,
          key,
          order: index,
          json,
        })
      }
    }

    await ctx.db.patch(presentationId, {
      title,
      slideCount: order.length,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const owned = await ownedPresentation(ctx, id)
    if (!owned) return
    const presentationId = owned.presentation._id
    const slides = await ctx.db
      .query("slides")
      .withIndex("by_presentation_order", (q) =>
        q.eq("presentationId", presentationId)
      )
      .collect()
    for (const slide of slides) await ctx.db.delete(slide._id)
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_presentation", (q) =>
        q.eq("presentationId", presentationId)
      )
      .collect()
    for (const asset of assets) {
      await ctx.storage.delete(asset.storageId)
      await ctx.db.delete(asset._id)
    }
    await ctx.db.delete(presentationId)
  },
})
