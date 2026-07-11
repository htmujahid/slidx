import { ROOT_NODE, useEditor } from "@craftjs/core"

import { OutlineRect } from "./outline-rect"

export function SelectionOverlay() {
  const { selected, hovered } = useEditor((state, query) => {
    const collectTarget = (id: string | undefined) => {
      if (!id || id === ROOT_NODE) return null
      const node = state.nodes[id]
      if (!node || node.data.hidden) return null
      return { id, dom: node.dom, props: node.data.props }
    }
    return {
      selected: collectTarget(query.getEvent("selected").first()),
      hovered: collectTarget(query.getEvent("hovered").first()),
    }
  })

  return (
    <g data-editor-overlay="" pointerEvents="none">
      {hovered && hovered.id !== selected?.id ? (
        <OutlineRect target={hovered} variant="hover" />
      ) : null}
      {selected ? <OutlineRect target={selected} variant="selected" /> : null}
    </g>
  )
}
