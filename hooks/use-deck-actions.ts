"use client"

import * as React from "react"
import { useEditor } from "@craftjs/core"

import { createDeckActions } from "@/lib/editor/deck-actions"
import { useEditorStores } from "@/components/editor/editor-stores"

function useDeckActions() {
  const { deck } = useEditorStores()
  // No collector: this never re-renders, and actions/query are stable.
  const { actions, query } = useEditor()
  return React.useMemo(
    () => createDeckActions(deck, { actions, query }),
    [deck, actions, query]
  )
}

export { useDeckActions }
