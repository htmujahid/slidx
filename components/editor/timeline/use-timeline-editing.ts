import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"

import {
  DEFAULT_ANIMATION,
  type AnimationPreset,
  type ElementAnimation,
  type TimelineEntry,
} from "@/lib/editor/animation"
import { trackPointer } from "@/lib/editor/geometry"
import {
  editBar,
  moveBar,
  snapTime,
  type BarEditMode,
} from "@/lib/editor/timeline-edit"
import {
  NUDGE_LARGE_MS,
  NUDGE_MS,
} from "@/components/editor/timeline/constants"

/** Every change the timeline makes to the slide: bars, animations, order. */
export function useTimelineEditing({
  pxPerMs,
  playhead,
  rowIds,
}: {
  pxPerMs: number
  /** Where new animations start. */
  playhead: number
  /** Element ids in the order the rows are shown. */
  rowIds: string[]
}) {
  const { actions } = useEditor()

  // Dragging produces a stream of changes, merged into one undo step.
  const setAnimation = (id: string, patch: Partial<ElementAnimation>) =>
    actions.history.throttle(400).setProp(id, (props) => {
      props.animation = { ...DEFAULT_ANIMATION, ...props.animation, ...patch }
    })

  const startEdit = (
    event: React.PointerEvent,
    entry: TimelineEntry,
    mode: BarEditMode
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    actions.selectNode(entry.id)
    const origin = event.clientX
    trackPointer(
      (move) =>
        setAnimation(
          entry.id,
          editBar(entry, mode, (move.clientX - origin) / pxPerMs)
        ),
      undefined,
      event.pointerId
    )
  }

  const nudge = (event: React.KeyboardEvent, entry: TimelineEntry) => {
    const direction =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    const step = event.shiftKey ? NUDGE_LARGE_MS : NUDGE_MS
    setAnimation(entry.id, moveBar(entry, entry.start + direction * step))
  }

  // The new animation starts where the playhead is, so choosing the moment
  // first places it exactly there.
  const addAnimation = (id: string, preset: AnimationPreset) => {
    const start = Math.max(0, snapTime(playhead))
    actions.selectNode(id)
    actions.setProp(id, (props) => {
      props.animation = {
        ...DEFAULT_ANIMATION,
        ...props.animation,
        preset,
        trigger: "enter",
        delay: start,
      }
    })
  }

  const removeAnimation = (id: string) =>
    actions.setProp(id, (props) => {
      props.animation = {
        ...DEFAULT_ANIMATION,
        ...props.animation,
        preset: "none",
      }
    })

  const reorder = ({
    activeIndex,
    overIndex,
  }: {
    activeIndex: number
    overIndex: number
  }) => {
    const next = [...rowIds]
    const [moved] = next.splice(activeIndex, 1)
    next.splice(overIndex, 0, moved)
    actions.setProp(ROOT_NODE, (props) => {
      props.animationOrder = next
    })
  }

  return {
    selectElement: (id: string) => actions.selectNode(id),
    startEdit,
    nudge,
    addAnimation,
    removeAnimation,
    reorder,
  }
}
