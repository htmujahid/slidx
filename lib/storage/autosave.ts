import type { StoreApi } from "zustand"

import type { SlideData } from "@/lib/editor/slides"
import type { DeckState } from "@/lib/editor/stores/deck-store"
import { toast } from "@/components/ui/toast"

import type { StorageService } from "./types"

const SAVE_DELAY_MS = 800

type SavedState = {
  title: string
  order: string
  json: Map<string, string>
  persisted: boolean
}
export function startAutosave({
  deck,
  snapshot,
  service,
  persisted,
}: {
  deck: StoreApi<DeckState>
  snapshot: () => SlideData[]
  service: StorageService
  persisted: boolean
}) {
  const initial = deck.getState()
  let saved: SavedState = {
    title: initial.title,
    order: initial.slides.map((slide) => slide.id).join(),
    json: new Map(initial.slides.map((slide) => [slide.id, slide.json])),
    persisted,
  }
  let queue: Promise<void> = Promise.resolve()
  let failure: string | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const saveNow = () => {
    queue = queue.then(async () => {
      const state = deck.getState()
      const all = (() => {
        try {
          return snapshot()
        } catch {
          return state.slides
        }
      })()
      const order = all.map((slide) => slide.id)
      const dirty = all.filter(
        (slide) => saved.json.get(slide.id) !== slide.json
      )
      if (
        !dirty.length &&
        saved.title === state.title &&
        saved.order === order.join()
      ) {
        return
      }
      const changed = (saved.persisted ? dirty : all).map(({ id, json }) => ({
        id,
        json,
      }))
      try {
        await service.save(state.presentationId, {
          title: state.title,
          order,
          changed,
        })
        saved = {
          title: state.title,
          order: order.join(),
          json: new Map(all.map((slide) => [slide.id, slide.json])),
          persisted: true,
        }
        failure = null
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Changes were not saved."
        if (failure !== message) {
          failure = message
          toast.add({
            type: "error",
            title: "Could not save",
            description: message,
          })
        }
      }
    })
    return queue
  }

  const unsubscribe = deck.subscribe((state, previous) => {
    if (state.slides === previous.slides && state.title === previous.title)
      return
    clearTimeout(timer)
    timer = setTimeout(saveNow, SAVE_DELAY_MS)
  })

  const flush = () => {
    if (document.visibilityState === "hidden") void saveNow()
  }
  document.addEventListener("visibilitychange", flush)
  window.addEventListener("pagehide", flush)

  return () => {
    unsubscribe()
    clearTimeout(timer)
    document.removeEventListener("visibilitychange", flush)
    window.removeEventListener("pagehide", flush)
    void saveNow()
  }
}
