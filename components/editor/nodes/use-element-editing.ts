"use client"

import { useEditor, useNode } from "@craftjs/core"

import { useChrome } from "@/lib/editor/stores/chrome-store"

function useElementEditing() {
  const { id } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const editingId = useChrome((state) => state.editingId)
  const setEditingId = useChrome((state) => state.setEditingId)

  return {
    editing: enabled && editingId === id,
    start: () => {
      if (enabled) setEditingId(id)
    },
    stop: () => {
      if (enabled) setEditingId(null)
    },
  }
}

export { useElementEditing }
