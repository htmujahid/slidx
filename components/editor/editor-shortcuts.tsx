"use client"

import * as React from "react"
import { useEditor } from "@craftjs/core"

import { NUDGE, NUDGE_LARGE } from "@/lib/editor/constants"
import { canEditContent } from "@/lib/editor/labels"
import { useEditorActions } from "@/hooks/use-editor-actions"
import { useFileActions } from "@/hooks/use-file-actions"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { usePresentation } from "@/components/editor/presentation-mode"

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

function EditorShortcuts() {
  const { actions, query } = useEditor()
  const {
    duplicate,
    remove,
    copy,
    cut,
    paste,
    selectAll,
    nudge,
    reorder,
    group,
    ungroup,
  } = useEditorActions()
  const { save, open } = useFileActions()
  const { setEditingId, zoomIn, zoomOut, zoomReset } = useEditorLayout()
  const { presenting } = usePresentation()

  React.useEffect(() => {
    if (presenting) return
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (mod && key === "s") {
        event.preventDefault()
        save()
        return
      }
      if (mod && key === "o") {
        event.preventDefault()
        open()
        return
      }
      if (mod && (key === "=" || key === "+")) {
        event.preventDefault()
        zoomIn()
        return
      }
      if (mod && key === "-") {
        event.preventDefault()
        zoomOut()
        return
      }
      if (mod && key === "0") {
        event.preventDefault()
        zoomReset()
        return
      }

      if (isEditableTarget(event.target)) return
      if (
        event.target instanceof Element &&
        event.target.closest("[data-slide-list]")
      )
        return

      if (mod && key === "z") {
        event.preventDefault()
        if (event.shiftKey) actions.history.redo()
        else actions.history.undo()
      } else if (mod && key === "y") {
        event.preventDefault()
        actions.history.redo()
      } else if (mod && key === "d") {
        event.preventDefault()
        duplicate()
      } else if (mod && key === "g") {
        event.preventDefault()
        if (event.shiftKey) ungroup()
        else group()
      } else if (mod && key === "c") {
        if (copy()) event.preventDefault()
      } else if (mod && key === "x") {
        event.preventDefault()
        cut()
      } else if (mod && key === "v") {
        event.preventDefault()
        paste()
      } else if (mod && key === "a") {
        event.preventDefault()
        selectAll()
      } else if (
        mod &&
        (event.key === "}" || (event.shiftKey && event.key === "]"))
      ) {
        event.preventDefault()
        reorder("front")
      } else if (
        mod &&
        (event.key === "{" || (event.shiftKey && event.key === "["))
      ) {
        event.preventDefault()
        reorder("back")
      } else if (mod && event.key === "]") {
        event.preventDefault()
        reorder("forward")
      } else if (mod && event.key === "[") {
        event.preventDefault()
        reorder("backward")
      } else if (key === "delete" || key === "backspace") {
        event.preventDefault()
        remove()
      } else if (key === "enter" && document.activeElement === document.body) {
        const [id] = query.getEvent("selected").all()
        if (id) {
          const { data } = query.node(id).get()
          if (canEditContent({ name: data.name, props: data.props })) {
            event.preventDefault()
            setEditingId(id)
          }
        }
      } else if (key === "escape") {
        actions.clearEvents()
      } else if (event.key in ARROWS) {
        if (query.getEvent("selected").size() === 0) return
        event.preventDefault()
        const step = event.shiftKey ? NUDGE_LARGE : NUDGE
        const [dx, dy] = ARROWS[event.key]
        nudge(dx * step, dy * step)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    presenting,
    actions,
    query,
    duplicate,
    remove,
    copy,
    cut,
    paste,
    selectAll,
    nudge,
    reorder,
    group,
    ungroup,
    save,
    open,
    setEditingId,
    zoomIn,
    zoomOut,
    zoomReset,
  ])

  return null
}

export { EditorShortcuts }
