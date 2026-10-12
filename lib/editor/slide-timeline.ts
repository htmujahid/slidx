import { ROOT_NODE, type Nodes } from "@craftjs/core"

import {
  buildTimeline,
  type ElementAnimation,
  type TimelineInput,
} from "@/lib/editor/animation"

/** The slide's animation timeline, in layer order (bottom to top). */
export function slideTimeline(nodes: Nodes) {
  const inputs: TimelineInput[] = (nodes[ROOT_NODE]?.data.nodes ?? []).flatMap(
    (id) => {
      const node = nodes[id]
      if (!node || node.data.hidden) return []
      const props = node.data.props as {
        animation?: Partial<ElementAnimation>
        text?: string
      }
      return [
        {
          id,
          name: node.data.name,
          animation: props.animation,
          text: props.text,
        },
      ]
    }
  )
  return buildTimeline(inputs)
}
