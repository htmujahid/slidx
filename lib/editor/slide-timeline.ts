import { ROOT_NODE, type Nodes } from "@craftjs/core"

import {
  buildTimeline,
  DEFAULT_SLIDE_DURATION,
  resolveTiming,
  type ElementTiming,
  type TimelineInput,
} from "@/lib/editor/animation"
import type { ChartKind } from "@/lib/editor/chart"
import { elementValues } from "@/lib/editor/tracks"

export function slideDuration(nodes: Nodes) {
  const duration = (nodes[ROOT_NODE]?.data.props as { duration?: number })
    ?.duration
  return typeof duration === "number" && duration > 0
    ? duration
    : DEFAULT_SLIDE_DURATION
}

export function timelineElementIds(nodes: Nodes) {
  return [...(nodes[ROOT_NODE]?.data.nodes ?? [])]
    .filter((id) => nodes[id] && !nodes[id].data.hidden)
    .reverse()
}

function slideInput(nodes: Nodes): TimelineInput {
  const timing = (nodes[ROOT_NODE]?.data.props as { timing?: ElementTiming })
    ?.timing
  const [span] = resolveTiming(timing).spans
  return {
    id: ROOT_NODE,
    name: "Slide",
    timing: {
      spans: [
        {
          ...span,
          start: 0,
          end: null,
          exit: { ...span.exit, preset: "none" },
        },
      ],
      tracks: [],
    },
  }
}

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
      values: elementValues(node.data.props),
      chart:
        node.data.name === "ChartBox" && props.kind
          ? { kind: props.kind, categories: props.rows?.length ?? 0 }
          : undefined,
    }
  })
  return buildTimeline([slideInput(nodes), ...inputs], slideDuration(nodes))
}
