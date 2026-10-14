import { openDB, type DBSchema, type IDBPDatabase } from "idb"

import { withCompression } from "@/lib/storage/compress"
import type {
  AssetScope,
  PresentationSummary,
  SavePresentationInput,
  StorageService,
  StoredPresentation,
  StoredSlide,
} from "@/lib/storage/types"

interface VisxDatabase extends DBSchema {
  presentations: {
    key: string
    value: { id: string; title: string; order: string[]; updatedAt: number }
  }
  slides: {
    key: string
    value: { presentationId: string; id: string; json: string }
    indexes: { "by-presentation": string }
  }
  assets: {
    key: string
    value: { id: string; presentationId?: string; blob: Blob }
    indexes: { "by-presentation": string }
  }
}

let database: Promise<IDBPDatabase<VisxDatabase>> | undefined

const open = () =>
  (database ??= openDB<VisxDatabase>("visx", 3, {
    upgrade(db) {
      for (const name of Array.from(db.objectStoreNames)) {
        db.deleteObjectStore(name as never)
      }
      db.createObjectStore("presentations", { keyPath: "id" })
      db.createObjectStore("slides", {
        keyPath: ["presentationId", "id"],
      }).createIndex("by-presentation", "presentationId")
      db.createObjectStore("assets", { keyPath: "id" }).createIndex(
        "by-presentation",
        "presentationId"
      )
    },
  }))

const objectUrls = new Map<string, string>()

async function save(id: string, input: SavePresentationInput) {
  const db = await open()
  const tx = db.transaction(["presentations", "slides"], "readwrite")
  const keep = new Set(input.order)
  const slides = tx.objectStore("slides")
  for (const slide of await slides.index("by-presentation").getAll(id)) {
    if (!keep.has(slide.id)) await slides.delete([id, slide.id] as never)
  }
  for (const { id: slideId, json } of input.changed) {
    await slides.put({ presentationId: id, id: slideId, json })
  }
  await tx.objectStore("presentations").put({
    id,
    title: input.title,
    order: input.order,
    updatedAt: Date.now(),
  })
  await tx.done
}

const rawLocalService: StorageService = {
  kind: "local",

  async list(): Promise<PresentationSummary[]> {
    const db = await open()
    const all = await db.getAll("presentations")
    return all
      .map(({ id, title, order, updatedAt }) => ({
        id,
        title,
        slideCount: order.length,
        updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  },

  async get(id): Promise<StoredPresentation | null> {
    const db = await open()
    const presentation = await db.get("presentations", id)
    if (!presentation) return null
    const stored = await db.getAllFromIndex("slides", "by-presentation", id)
    const byId = new Map(stored.map((slide) => [slide.id, slide]))
    const slides = presentation.order.flatMap((slideId) => {
      const slide = byId.get(slideId)
      return slide ? [{ id: slide.id, json: slide.json }] : []
    })
    return { id, title: presentation.title, slides }
  },

  async create({ title, slides }) {
    const id = crypto.randomUUID()
    await save(id, {
      title,
      order: slides.map((slide: StoredSlide) => slide.id),
      changed: slides,
    })
    return id
  },

  save,

  async remove(id) {
    const db = await open()
    const tx = db.transaction(
      ["presentations", "slides", "assets"],
      "readwrite"
    )
    for (const name of ["slides", "assets"] as const) {
      const store = tx.objectStore(name)
      const keys = await store.index("by-presentation").getAllKeys(id)
      for (const key of keys) await store.delete(key as never)
    }
    await tx.objectStore("presentations").delete(id)
    await tx.done
  },

  async putAsset(file: Blob, scope?: AssetScope) {
    const db = await open()
    const id = crypto.randomUUID()
    await db.put("assets", {
      id,
      presentationId: scope?.presentationId,
      blob: file,
    })
    return id
  },

  async getAssetBlob(id) {
    const db = await open()
    return (await db.get("assets", id))?.blob ?? null
  },

  async getAssetUrl(id) {
    const cached = objectUrls.get(id)
    if (cached) return cached
    const blob = await this.getAssetBlob(id)
    if (!blob) return null
    const url = URL.createObjectURL(blob)
    objectUrls.set(id, url)
    return url
  },
}

export const localService = withCompression(rawLocalService)
