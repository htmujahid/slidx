"use client"

import * as React from "react"
import { useStore, type StoreApi } from "zustand"

import { useChrome } from "@/lib/editor/stores/chrome-store"
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
import { usePreview } from "@/lib/editor/stores/preview-store"
import { useViewport } from "@/lib/editor/stores/viewport-store"

type EditorStores = {
  craft: CraftRef
  deck: StoreApi<DeckState>
  presenter: StoreApi<PresenterState>
}

const EditorStoresContext = React.createContext<EditorStores | null>(null)

function resetEditorUi() {
  usePreview.getState().stop()
  useChrome.setState(useChrome.getInitialState(), true)
  useViewport.setState(useViewport.getInitialState(), true)
  usePreview.setState(usePreview.getInitialState(), true)
}

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
    return { craft, deck, presenter: createPresenterStore({ deck }) }
  })
  React.useEffect(() => {
    const unsubscribe = stores.deck.subscribe((state, previous) => {
      if (state.activeId !== previous.activeId) usePreview.getState().stop()
    })
    return () => {
      unsubscribe()
      resetEditorUi()
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

export {
  EditorStoresProvider,
  selectActiveIndex,
  useDeck,
  useEditorStores,
  usePresenter,
}
