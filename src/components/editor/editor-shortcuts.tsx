import { useEffect } from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"

export function EditorShortcuts() {
  const { actions, query } = useEditor()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          if (query.history.canRedo()) actions.history.redo()
        } else if (query.history.canUndo()) {
          actions.history.undo()
        }
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault()
        if (query.history.canRedo()) actions.history.redo()
        return
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        const selected = query.getEvent("selected").first()
        if (
          selected &&
          selected !== ROOT_NODE &&
          query.node(selected).isDeletable()
        ) {
          event.preventDefault()
          actions.delete(selected)
        }
        return
      }

      if (event.key === "Escape") {
        actions.selectNode()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [actions, query])

  return null
}
