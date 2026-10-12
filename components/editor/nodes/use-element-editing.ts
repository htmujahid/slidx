"use client"

import { useEditor, useNode } from "@craftjs/core"

import { useOptionalEditorLayout } from "@/components/editor/editor-layout"

function useElementEditing() {
  const { id } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const layout = useOptionalEditorLayout()

  return {
    editing: enabled && layout?.editingId === id,
    start: () => {
      if (enabled) layout?.setEditingId(id)
    },
    stop: () => layout?.setEditingId(null),
  }
}

export { useElementEditing }
