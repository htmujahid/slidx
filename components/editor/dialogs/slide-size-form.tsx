"use client"

import * as React from "react"
import { ArrowLeftRightIcon } from "lucide-react"

import {
  aspectLabel,
  clampDimension,
  MAX_SLIDE_DIMENSION,
  MIN_SLIDE_DIMENSION,
  sameSize,
  SLIDE_SIZE_PRESETS,
  type ResizeMode,
  type SlideSize,
} from "@/lib/editor/slide-size"
import { useDeckActions } from "@/hooks/use-deck-actions"
import { useSlideSize } from "@/hooks/use-slide-size"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label} (px)</FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={MIN_SLIDE_DIMENSION}
        max={MAX_SLIDE_DIMENSION}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

const CUSTOM = "custom"

const PREVIEW_BOX = 96

const MODES: { value: ResizeMode; label: string; hint: string }[] = [
  {
    value: "scale",
    label: "Scale content",
    hint: "Fits everything inside the new size at the same proportions, text and strokes included, and centres it.",
  },
  {
    value: "keep",
    label: "Keep as is",
    hint: "Leaves every element where it is. Anything past the new edges is cut off.",
  },
]

export function SlideSizeForm({ onDone }: { onDone: () => void }) {
  const current = useSlideSize()
  const { resizeSlides } = useDeckActions()
  const [width, setWidth] = React.useState(String(current.width))
  const [height, setHeight] = React.useState(String(current.height))
  const [mode, setMode] = React.useState<ResizeMode>("scale")
  const presetId = React.useId()

  const next: SlideSize = {
    width: clampDimension(Number(width) || current.width),
    height: clampDimension(Number(height) || current.height),
  }
  const preset = SLIDE_SIZE_PRESETS.find((candidate) =>
    sameSize(candidate, next)
  )
  const changed = !sameSize(next, current)
  const fit = PREVIEW_BOX / Math.max(next.width, next.height)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (changed) resizeSlides(next, mode)
        onDone()
      }}
    >
      <FieldGroup className="gap-4">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center rounded-lg bg-muted"
            style={{ width: PREVIEW_BOX + 16, height: PREVIEW_BOX + 16 }}
          >
            <div
              className="rounded-[3px] border bg-background shadow-xs"
              style={{ width: next.width * fit, height: next.height * fit }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1 text-sm">
            <span className="font-medium tabular-nums">
              {next.width} × {next.height} px
            </span>
            <span className="text-muted-foreground">
              {aspectLabel(next)}
              {changed ? "" : " · current size"}
            </span>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor={presetId}>Preset</FieldLabel>
          <NativeSelect
            id={presetId}
            className="w-full"
            value={preset?.id ?? CUSTOM}
            onChange={(event) => {
              const chosen = SLIDE_SIZE_PRESETS.find(
                (candidate) => candidate.id === event.target.value
              )
              if (!chosen) return
              setWidth(String(chosen.width))
              setHeight(String(chosen.height))
            }}
          >
            {SLIDE_SIZE_PRESETS.map((candidate) => (
              <NativeSelectOption key={candidate.id} value={candidate.id}>
                {candidate.label} — {candidate.width} × {candidate.height}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value={CUSTOM}>Custom</NativeSelectOption>
          </NativeSelect>
        </Field>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <DimensionField label="Width" value={width} onChange={setWidth} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Swap width and height"
            onClick={() => {
              setWidth(height)
              setHeight(width)
            }}
          >
            <ArrowLeftRightIcon />
          </Button>
          <DimensionField label="Height" value={height} onChange={setHeight} />
        </div>
        <FieldDescription>
          From {MIN_SLIDE_DIMENSION} to {MAX_SLIDE_DIMENSION} px each way.
        </FieldDescription>

        <Field>
          <FieldLabel>Existing content</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={0}
            className="w-full"
            aria-label="Existing content"
            value={[mode]}
            onValueChange={([value]) => {
              if (value) setMode(value as ResizeMode)
            }}
          >
            {MODES.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className="flex-1"
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription>
            {MODES.find((item) => item.value === mode)?.hint}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={!changed}>
          Apply to all slides
        </Button>
      </DialogFooter>
    </form>
  )
}
