import type { Node } from "@craftjs/core"

import { EFFECT_PROPS, buildRef, definitionMeta } from "./defs-registry"

type EffectActions = {
  setProp: (
    nodeId: string,
    cb: (props: Record<string, unknown>) => void
  ) => void
}

type EffectQuery = {
  getNodes: () => Record<string, Node>
}

export function applyEffect(
  actions: EffectActions,
  query: EffectQuery,
  shapeId: string,
  defId: string
) {
  const defNode = query.getNodes()[defId]
  const meta = defNode && definitionMeta(defNode.data.type)
  if (!meta) return
  actions.setProp(shapeId, (props) => {
    props[meta.applyProp] = buildRef(defId)
  })
}

export function clearEffectRefs(
  actions: EffectActions,
  query: EffectQuery,
  defId: string
) {
  const ref = buildRef(defId)
  for (const [id, node] of Object.entries(query.getNodes())) {
    const props = node.data.props as Record<string, unknown>
    for (const key of EFFECT_PROPS) {
      if (props[key] !== ref) continue
      if (key === "fill") {
        const defaults = (
          node.data.type as { craft?: { props?: Record<string, unknown> } }
        ).craft?.props
        actions.setProp(id, (p) => {
          p.fill = defaults?.fill ?? "#000000"
        })
      } else {
        actions.setProp(id, (p) => {
          p[key] = undefined
        })
      }
    }
  }
}
