import { ROOT_NODE, type Nodes } from "@craftjs/core"

import {
  buildTimeline,
  DEFAULT_SLIDE_DURATION,
  type ElementTiming,
  type TimelineInput,
} from "@/lib/editor/animation"
import type { ChartKind } from "@/lib/editor/chart"

/** How long the slide plays, in milliseconds. */
export function slideDuration(nodes: Nodes) {
  const duration = (nodes[ROOT_NODE]?.data.props as { duration?: number })
    ?.duration
  return typeof duration === "number" && duration > 0
    ? duration
    : DEFAULT_SLIDE_DURATION
}

/** The slide's visible elements, topmost layer first, as the timeline lists them. */
export function timelineElementIds(nodes: Nodes) {
  return [...(nodes[ROOT_NODE]?.data.nodes ?? [])]
    .filter((id) => nodes[id] && !nodes[id].data.hidden)
    .reverse()
}

/** The slide's timeline: when each element is on the slide, and how it enters and leaves. */
export function slideTimeline(nodes: Nodes) {
  const inputs: TimelineInput[] = timelineElementIds(nodes).map((id) => {
    const node = nodes[id]
    const props = node.data.props as {
      timing?: Partial<ElementTiming>
      text?: string
      kind?: ChartKind
      rows?: unknown[]
    }
    return {
      id,
      name: node.data.name,
      timing: props.timing,
      text: props.text,
      chart:
        node.data.name === "ChartBox" && props.kind
          ? { kind: props.kind, categories: props.rows?.length ?? 0 }
          : undefined,
    }
  })
  return buildTimeline(inputs, slideDuration(nodes))
}
