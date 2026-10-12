import { ROOT_NODE, type Nodes } from "@craftjs/core"

import {
  buildTimeline,
  type ElementAnimation,
  type TimelineInput,
} from "@/lib/editor/animation"
import { orderIds } from "@/lib/editor/timeline-edit"

/** The slide's visible elements in animation order. */
export function orderedElementIds(nodes: Nodes) {
  const root = nodes[ROOT_NODE]
  const layerIds = (root?.data.nodes ?? []).filter(
    (id) => nodes[id] && !nodes[id].data.hidden
  )
  const saved = (root?.data.props as { animationOrder?: string[] } | undefined)
    ?.animationOrder
  return orderIds(layerIds, saved)
}

/** The slide's animation timeline, in animation order. */
export function slideTimeline(nodes: Nodes) {
  const inputs: TimelineInput[] = orderedElementIds(nodes).map((id) => {
    const node = nodes[id]
    const props = node.data.props as {
      animation?: Partial<ElementAnimation>
      text?: string
    }
    return {
      id,
      name: node.data.name,
      animation: props.animation,
      text: props.text,
    }
  })
  return buildTimeline(inputs)
}
