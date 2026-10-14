"use client"

import * as React from "react"
import { useEditor } from "@craftjs/core"

import { resolveTiming } from "@/lib/editor/animation"
import { EASINGS, type AnimationEasing } from "@/lib/editor/easing"
import { getElementLabel } from "@/lib/editor/labels"
import { useChrome } from "@/lib/editor/stores/chrome-store"
import {
  elementValues,
  propertiesFor,
  restValue,
  TRACK_PROPERTIES,
  type TrackGroup,
  type TrackProperty,
} from "@/lib/editor/tracks"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { PropertyLane } from "@/components/editor/keyframes/property-lane"
import { useKeyframeEditing } from "@/components/editor/keyframes/use-keyframe-editing"
import {
  DEFAULT_ZOOM,
  LABEL_WIDTH,
  LANE_HEIGHT,
  RULER_HEIGHT,
  ZOOMS,
} from "@/components/editor/timeline/constants"
import { TimelineRuler } from "@/components/editor/timeline/timeline-ruler"
import { useTimelineData } from "@/components/editor/timeline/use-timeline-data"
import { useTimelinePlayback } from "@/components/editor/timeline/use-timeline-playback"

type Selection = { property: TrackProperty; index: number }

function KeyframeEditor({ id }: { id: string }) {
  const { node } = useEditor((state) => ({ node: state.nodes[id]?.data }))
  const { timeline } = useTimelineData()
  const [selection, setSelection] = React.useState<Selection | null>(null)

  const { durationMs } = timeline
  const pxPerMs = ZOOMS[DEFAULT_ZOOM] / 1000
  const trackWidth = durationMs * pxPerMs
  const playback = useTimelinePlayback({ durationMs, pxPerMs })

  const props = node?.props
  const tracks = React.useMemo(
    () => resolveTiming(props?.timing).tracks,
    [props?.timing]
  )
  const values = React.useMemo(
    () => elementValues((props ?? {}) as Record<string, unknown>),
    [props]
  )
  const editing = useKeyframeEditing({
    id,
    tracks,
    values,
    playhead: playback.playhead,
    pxPerMs,
    durationMs,
  })

  if (!node) return null

  const properties = propertiesFor(node.name)
  const groups = [
    ...new Set(properties.map((property) => TRACK_PROPERTIES[property].group)),
  ] as TrackGroup[]
  const lanes = properties.length + groups.length
  const selected = selection
    ? [...(editing.trackOf(selection.property)?.keyframes ?? [])].sort(
        (a, b) => a.at - b.at
      )[selection.index]
    : undefined

  return (
    <>
      <DialogHeader>
        <DialogTitle>Keyframes</DialogTitle>
        <DialogDescription>
          {getElementLabel({ name: node.name, props: node.props })}. Move the
          playhead, then change a value or press the diamond to set a keyframe.
        </DialogDescription>
      </DialogHeader>

      <div className="relative max-h-[55vh] overflow-auto rounded-lg border">
        <div
          className="relative"
          style={{ width: LABEL_WIDTH + trackWidth, minWidth: "100%" }}
        >
          <TimelineRuler
            rulerRef={playback.rulerRef}
            trackWidth={trackWidth}
            pxPerMs={pxPerMs}
            lengthMs={durationMs}
            playheadMs={playback.playhead}
            showPlayhead
            onPointerDown={playback.startScrub}
            onKeyDown={playback.scrubKey}
          />
          {groups.map((group) => (
            <div key={group} role="group" aria-label={group}>
              <div
                className="sticky left-0 flex h-7 items-center border-b bg-muted/50 px-3 text-xs font-medium"
                style={{ width: LABEL_WIDTH + trackWidth }}
              >
                {group}
              </div>
              {properties
                .filter(
                  (property) => TRACK_PROPERTIES[property].group === group
                )
                .map((property) => (
                  <PropertyLane
                    key={property}
                    property={property}
                    track={editing.trackOf(property)}
                    rest={restValue(property, values)}
                    playhead={playback.playhead}
                    pxPerMs={pxPerMs}
                    trackWidth={trackWidth}
                    gridWidth={ZOOMS[DEFAULT_ZOOM]}
                    selectedIndex={
                      selection?.property === property
                        ? selection.index
                        : undefined
                    }
                    onToggle={() => editing.toggle(property)}
                    onSetValue={(value) => editing.setValue(property, value)}
                    onKeyframePointerDown={(event, index) =>
                      editing.startDrag(event, property, index, () =>
                        setSelection({ property, index })
                      )
                    }
                    onKeyframeKeyDown={(event, index) => {
                      editing.keyDown(event, property, index)
                      if (event.key === "Delete" || event.key === "Backspace")
                        setSelection(null)
                    }}
                  />
                ))}
            </div>
          ))}
          <div
            data-timeline-playhead=""
            className="pointer-events-none absolute z-[5] w-px bg-primary"
            style={{
              left: LABEL_WIDTH + playback.playhead * pxPerMs,
              top: RULER_HEIGHT,
              height: lanes * LANE_HEIGHT,
            }}
          />
        </div>
      </div>

      {tracks.some((track) =>
        ["opacity", "blur", "brightness", "grayscale"].includes(track.property)
      ) ? (
        <p className="text-xs text-muted-foreground">
          Fade and blur transitions from the timeline take precedence over
          opacity, blur, brightness and grayscale keyframes while they play.
        </p>
      ) : null}

      <div className="flex min-h-8 flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {selection && selected ? (
          <>
            <span className="min-w-0 flex-1 truncate text-foreground">
              {TRACK_PROPERTIES[selection.property].label} keyframe at{" "}
              {(selected.at / 1000).toFixed(2)}s
            </span>
            <NativeSelect
              aria-label="Easing to the next keyframe"
              value={selected.easing}
              onChange={(event) =>
                editing.setEasing(
                  selection.property,
                  selection.index,
                  event.target.value as AnimationEasing
                )
              }
            >
              {(Object.keys(EASINGS) as AnimationEasing[]).map((easing) => (
                <NativeSelectOption key={easing} value={easing}>
                  {EASINGS[easing].label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                editing.remove(selection.property, selection.index)
                setSelection(null)
              }}
            >
              Delete keyframe
            </Button>
          </>
        ) : (
          <span>Select a keyframe to change how it eases.</span>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          disabled={tracks.length === 0}
          onClick={() => {
            editing.clear()
            setSelection(null)
          }}
        >
          Clear keyframes
        </Button>
        <DialogClose render={<Button />}>Done</DialogClose>
      </DialogFooter>
    </>
  )
}

function KeyframeDialog() {
  const keyframeTarget = useChrome((state) =>
    typeof state.dialog === "object" && state.dialog ? state.dialog.id : null
  )
  const setDialog = useChrome((state) => state.setDialog)
  return (
    <Dialog
      open={keyframeTarget !== null}
      onOpenChange={(open) => {
        if (!open) setDialog(null)
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        {keyframeTarget ? <KeyframeEditor id={keyframeTarget} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { KeyframeDialog }
