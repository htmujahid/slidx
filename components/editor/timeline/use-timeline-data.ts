import * as React from "react"
import { useEditor } from "@craftjs/core"

import { getElementLabel } from "@/lib/editor/labels"
import { orderedElementIds, slideTimeline } from "@/lib/editor/slide-timeline"

export type TimelineRowData = {
  id: string
  name: string
  props: Record<string, unknown>
  label: string
}

/** What the timeline shows: a row per element, the animations, the selection. */
export function useTimelineData() {
  const { nodes, selected } = useEditor((state) => ({
    nodes: state.nodes,
    selected: [...state.events.selected],
  }))

  const timeline = React.useMemo(() => slideTimeline(nodes), [nodes])
  const entries = React.useMemo(
    () => new Map(timeline.entries.map((entry) => [entry.id, entry])),
    [timeline]
  )
  const rows = React.useMemo<TimelineRowData[]>(
    () =>
      orderedElementIds(nodes).map((id) => {
        const { name, props } = nodes[id].data
        return { id, name, props, label: getElementLabel({ name, props }) }
      }),
    [nodes]
  )

  return { rows, entries, timeline, selected }
}
