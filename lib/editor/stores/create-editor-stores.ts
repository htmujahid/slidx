import { createChromeStore } from "./chrome-store"
import { createDeckStore } from "./deck-store"
import { createPresenterStore } from "./presenter-store"
import { createPreviewStore } from "./preview-store"
import { createViewportStore } from "./viewport-store"

export function createEditorStores({
  presentationId,
}: {
  presentationId: string
}) {
  const deck = createDeckStore({ presentationId })
  const chrome = createChromeStore()
  const viewport = createViewportStore()
  const preview = createPreviewStore()
  const presenter = createPresenterStore({ deck, chrome })

  const unsubscribe = deck.subscribe((state, previous) => {
    if (state.activeId !== previous.activeId) preview.getState().stop()
  })

  return {
    deck,
    chrome,
    viewport,
    preview,
    presenter,
    dispose() {
      unsubscribe()
      preview.getState().stop()
    },
  }
}

export type EditorStores = ReturnType<typeof createEditorStores>
