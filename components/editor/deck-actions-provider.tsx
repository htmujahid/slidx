"use client"

import * as React from "react"
import { useEditor } from "@craftjs/core"

import { createDeckActions, type DeckActions } from "@/lib/editor/deck-actions"
import { useEditorStores } from "@/components/editor/editor-stores"

const DeckActionsContext = React.createContext<DeckActions | null>(null)

// Must sit under <Editor> and EditorStoresProvider: the actions need both the
// deck store and Craft's handle.
function DeckActionsProvider({ children }: { children: React.ReactNode }) {
  const { deck } = useEditorStores()
  // No collector: this never re-renders on editor state changes.
  const { actions, query } = useEditor()
  const value = React.useMemo(
    () => createDeckActions(deck, { actions, query }),
    [deck, actions, query]
  )
  return (
    <DeckActionsContext.Provider value={value}>
      {children}
    </DeckActionsContext.Provider>
  )
}

function useDeckActions() {
  const value = React.useContext(DeckActionsContext)
  if (!value) {
    throw new Error("useDeckActions must be used within DeckActionsProvider.")
  }
  return value
}

export { DeckActionsProvider, useDeckActions }
