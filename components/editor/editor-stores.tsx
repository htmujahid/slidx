"use client"

import * as React from "react"
import { useStore } from "zustand"

import type { ChromeState } from "@/lib/editor/stores/chrome-store"
import {
  createEditorStores,
  type EditorStores,
} from "@/lib/editor/stores/create-editor-stores"
import {
  selectActiveIndex,
  type DeckState,
} from "@/lib/editor/stores/deck-store"
import type { PresenterState } from "@/lib/editor/stores/presenter-store"
import type { PreviewState } from "@/lib/editor/stores/preview-store"
import type { ViewportState } from "@/lib/editor/stores/viewport-store"

const EditorStoresContext = React.createContext<EditorStores | null>(null)

function EditorStoresProvider({
  presentationId,
  children,
}: {
  presentationId: string
  children: React.ReactNode
}) {
  const [stores] = React.useState(() => createEditorStores({ presentationId }))
  React.useEffect(() => () => stores.dispose(), [stores])
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
