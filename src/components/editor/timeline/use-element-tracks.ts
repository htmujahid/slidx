import { ROOT_NODE, useEditor } from "@craftjs/core"

import { getAnimationMeta } from "../craft/animation-registry"
import {
  EFFECT_PROPS,
  definitionMeta,
  isDefsType,
  parseRef,
  type DefinitionKind,
  type EffectProp,
} from "../craft/defs/defs-registry"
import { getShapeMeta } from "../craft/shapes"
import type { TrackKind } from "../kind-icons"

export type ClipModel = {
  id: string
  label: string
  begin: number
  dur: number
  indefinite: boolean
  selected: boolean
}

export type EffectRef = {
  defId: string
  kind: DefinitionKind
  prop: EffectProp
  name: string
}

export type TrackModel = {
  id: string
  label: string
  kind: TrackKind
  hidden: boolean
  locked: boolean
  selected: boolean
  clips: ClipModel[]
  effects: EffectRef[]
}

export function useElementTracks() {
  const { tracks, actions, query } = useEditor((state, editorQuery) => {
    const rootIds = (state.nodes[ROOT_NODE]?.data.nodes ?? []) as string[]
    const selectedId = editorQuery.getEvent("selected").first()

    const tracks = rootIds.flatMap((id): TrackModel[] => {
      const node = state.nodes[id]
      if (!node || isDefsType(node.data.type)) return []
      const meta = getShapeMeta(node.data.type)
      const custom = node.data.custom as
        | { name?: string; locked?: boolean }
        | undefined
      const tag = meta?.tag ?? node.data.displayName

      const clips = ((node.data.nodes ?? []) as string[]).flatMap(
        (clipId): ClipModel[] => {
          const clip = state.nodes[clipId]
          const animationMeta = clip && getAnimationMeta(clip.data.type)
          if (!clip || !animationMeta) return []
          const props = clip.data.props as {
            begin?: number
            dur?: number
            repeatCount?: number | "indefinite"
          }
          return [
            {
              id: clipId,
              label: animationMeta.clipLabel(clip.data.props),
              begin: props.begin ?? 0,
              dur: props.dur ?? 1,
              indefinite: props.repeatCount === "indefinite",
              selected: selectedId === clipId,
            },
          ]
        }
      )

      const props = node.data.props as Record<string, unknown>
      const effects = EFFECT_PROPS.flatMap((key): EffectRef[] => {
        const defId = parseRef(props[key])
        const def = defId ? state.nodes[defId] : null
        const defMeta = def && definitionMeta(def.data.type)
        if (!defId || !defMeta) return []
        return [
          {
            defId,
            kind: defMeta.kind,
            prop: key,
            name: (def.data.props as { name?: string }).name ?? defMeta.kind,
          },
        ]
      })

      return [
        {
          id,
          label: custom?.name ? `${tag}#${custom.name}` : tag,
          kind: meta?.kind ?? "shape",
          hidden: !!node.data.hidden,
          locked: !!custom?.locked,
          selected: selectedId === id,
          clips,
          effects,
        },
      ]
    })

    return { tracks }
  })

  return { tracks, actions, query }
}
