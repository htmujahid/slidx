"use client"

import * as React from "react"
import { useStore, type StoreApi } from "zustand"

import {
  createChromeStore,
  type ChromeState,
} from "@/lib/editor/stores/chrome-store"
import {
  createCraftRef,
  createDeckStore,
  selectActiveIndex,
  type CraftRef,
  type DeckState,
} from "@/lib/editor/stores/deck-store"
import {
  createPresenterStore,
  type PresenterState,
} from "@/lib/editor/stores/presenter-store"
import {
  createPreviewStore,
  type PreviewState,
} from "@/lib/editor/stores/preview-store"
import {
  createViewportStore,
  type ViewportState,
} from "@/lib/editor/stores/viewport-store"

type EditorStores = {
  craft: CraftRef
  deck: StoreApi<DeckState>
  presenter: StoreApi<PresenterState>
  chrome: StoreApi<ChromeState>
  viewport: StoreApi<ViewportState>
  preview: StoreApi<PreviewState>
}

const EditorStoresContext = React.createContext<EditorStores | null>(null)

function EditorStoresProvider({
  presentationId,
  children,
}: {
  presentationId: string
  children: React.ReactNode
}) {
  const [stores] = React.useState<EditorStores>(() => {
    const craft = createCraftRef()
    const deck = createDeckStore({ presentationId, craft })
    const chrome = createChromeStore()
    const viewport = createViewportStore()
    const preview = createPreviewStore()
    const presenter = createPresenterStore({ deck, chrome })
    return { craft, deck, presenter, chrome, viewport, preview }
  })
  React.useEffect(() => {
    const unsubscribe = stores.deck.subscribe((state, previous) => {
      if (state.activeId !== previous.activeId) stores.preview.getState().stop()
    })
    return () => {
      unsubscribe()
      stores.preview.getState().stop()
    }
  }, [stores])
  return (
    <EditorStoresContext.Provider value={stores}>
      {children}
    </EditorStoresContext.Provider>
  )
}

function useEditorStores() {
  const stores = React.useContext(EditorStoresContext)
  if (!stores) {
    throw new Error("Editor stores must be used within EditorStoresProvider.")
  }
  return stores
}

function useDeck<T>(selector: (state: DeckState) => T) {
  return useStore(useEditorStores().deck, selector)
}

function usePresenter<T>(selector: (state: PresenterState) => T) {
  return useStore(useEditorStores().presenter, selector)
}

function useChrome<T>(selector: (state: ChromeState) => T) {
  return useStore(useEditorStores().chrome, selector)
}

function useViewport<T>(selector: (state: ViewportState) => T) {
  return useStore(useEditorStores().viewport, selector)
}

function usePreview<T>(selector: (state: PreviewState) => T) {
  return useStore(useEditorStores().preview, selector)
}

export {
  EditorStoresProvider,
  selectActiveIndex,
  useChrome,
  useDeck,
  usePreview,
  useViewport,
  useEditorStores,
  usePresenter,
}
