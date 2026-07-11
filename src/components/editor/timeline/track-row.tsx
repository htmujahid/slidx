import { useEditor } from "@craftjs/core"
import {
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  LockIcon,
  LockOpenIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { applyEffect } from "../craft/defs/apply-effect"
import { EFFECT_MIME } from "../craft/defs/defs-registry"
import { kindIcons } from "../kind-icons"
import { Clip } from "./clip"
import { EffectBadges } from "./effect-badges"
import { RailCell } from "./rail-cell"
import type { TrackModel } from "./use-element-tracks"

export function TrackRow({
  track,
  index,
  laneWidth,
  onTrackDragStart,
  onTrackDragOver,
  onTrackDragEnd,
}: {
  track: TrackModel
  index: number
  laneWidth: number
  onTrackDragStart: (id: string) => void
  onTrackDragOver: (event: React.DragEvent, index: number) => void
  onTrackDragEnd: () => void
}) {
  const { actions, query } = useEditor()
  const TrackIcon = kindIcons[track.kind]

  return (
    <div
      className="flex h-14 border-b"
      onClick={() => actions.selectNode(track.id)}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(EFFECT_MIME)) {
          if (!track.locked) event.preventDefault()
          return
        }
        onTrackDragOver(event, index)
      }}
      onDrop={(event) => {
        const defId = event.dataTransfer.getData(EFFECT_MIME)
        if (!defId || track.locked) return
        event.preventDefault()
        applyEffect(actions, query, track.id, defId)
        actions.selectNode(track.id)
      }}
    >
      <RailCell
        className={cn("group/rail", track.selected && "bg-accent")}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move"
          event.dataTransfer.setData("text/plain", track.id)
          onTrackDragStart(track.id)
        }}
        onDragEnd={onTrackDragEnd}
      >
        <GripVerticalIcon className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50 group-hover/rail:text-muted-foreground" />
        <TrackIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-mono text-xs",
            track.hidden && "text-muted-foreground line-through"
          )}
        >
          {track.label}
        </span>
        <EffectBadges track={track} />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(event) => {
            event.stopPropagation()
            actions.setHidden(track.id, !track.hidden)
          }}
        >
          {track.hidden ? <EyeOffIcon /> : <EyeIcon />}
          <span className="sr-only">
            {track.hidden ? `Show ${track.label}` : `Hide ${track.label}`}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(!track.locked && "text-muted-foreground/50")}
          onClick={(event) => {
            event.stopPropagation()
            actions.setCustom(track.id, (custom: { locked?: boolean }) => {
              custom.locked = !track.locked
            })
          }}
        >
          {track.locked ? <LockIcon /> : <LockOpenIcon />}
          <span className="sr-only">
            {track.locked ? `Unlock ${track.label}` : `Lock ${track.label}`}
          </span>
        </Button>
      </RailCell>

      <div
        className="relative h-full bg-muted/20"
        style={{ width: laneWidth }}
      >
        {track.clips.map((clip) => (
          <Clip
            key={clip.id}
            clip={clip}
            kind={track.kind}
            locked={track.locked}
            laneWidth={laneWidth}
          />
        ))}
      </div>
    </div>
  )
}
