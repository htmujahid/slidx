import { useEditor } from "@craftjs/core"
import {
  BlendIcon,
  EclipseIcon,
  FilterIcon,
  Grid2x2Icon,
  NavigationIcon,
  ScissorsIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DefinitionKind } from "../craft/defs/defs-registry"
import type { TrackModel } from "./use-element-tracks"

const kindIcons: Record<DefinitionKind, typeof FilterIcon> = {
  filter: FilterIcon,
  gradient: BlendIcon,
  clip: ScissorsIcon,
  mask: EclipseIcon,
  pattern: Grid2x2Icon,
  marker: NavigationIcon,
}

export function EffectBadges({ track }: { track: TrackModel }) {
  const { actions } = useEditor()

  if (track.effects.length === 0) return null

  return (
    <>
      {track.effects.map((effect) => {
        const removable = effect.prop !== "fill"
        const BadgeIcon = kindIcons[effect.kind]
        return (
          <Button
            key={`${effect.prop}-${effect.defId}`}
            variant="ghost"
            size="icon-xs"
            className="text-primary"
            title={
              removable
                ? `${effect.kind}: ${effect.name} — click to remove`
                : `${effect.kind} fill: ${effect.name} — click to edit`
            }
            onClick={(event) => {
              event.stopPropagation()
              if (removable) {
                actions.setProp(
                  track.id,
                  (props: Record<string, unknown>) => {
                    props[effect.prop] = undefined
                  }
                )
              } else {
                actions.selectNode(effect.defId)
              }
            }}
          >
            <BadgeIcon />
            <span className="sr-only">
              {removable
                ? `Remove ${effect.kind} ${effect.name}`
                : `Edit ${effect.kind} ${effect.name}`}
            </span>
          </Button>
        )
      })}
    </>
  )
}
