"use client"

import * as React from "react"
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
  FlipHorizontal2Icon,
  FlipVertical2Icon,
  RotateCwIcon,
  type LucideIcon,
} from "lucide-react"

import { alignToSlide, type Alignment } from "@/lib/editor/align"
import { MIN_ELEMENT_SIZE } from "@/lib/editor/constants"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"

const HORIZONTAL: Array<[Alignment, string, LucideIcon]> = [
  ["left", "Align left", AlignStartVerticalIcon],
  ["center", "Center horizontally", AlignCenterVerticalIcon],
  ["right", "Align right", AlignEndVerticalIcon],
]

const VERTICAL: Array<[Alignment, string, LucideIcon]> = [
  ["top", "Align top", AlignStartHorizontalIcon],
  ["middle", "Center vertically", AlignCenterHorizontalIcon],
  ["bottom", "Align bottom", AlignEndHorizontalIcon],
]

function AlignGroup({
  label,
  options,
  onAlign,
}: {
  label: string
  options: Array<[Alignment, string, LucideIcon]>
  onAlign: (alignment: Alignment) => void
}) {
  return (
    <ButtonGroup aria-label={label} className="w-full">
      {options.map(([alignment, name, Icon]) => (
        <Tooltip key={alignment}>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="flex-1"
                aria-label={name}
                onClick={() => onAlign(alignment)}
              />
            }
          >
            <Icon />
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      ))}
    </ButtonGroup>
  )
}

function TransformSettings({
  props,
  update,
  autoHeight,
  resizable = true,
}: {
  props: Partial<ElementTransformProps>
  update: (patch: Partial<ElementTransformProps>) => void
  autoHeight?: boolean
  resizable?: boolean
}) {
  const merged = { ...DEFAULT_TRANSFORM, ...props }
  const nameId = React.useId()

  return (
    <SettingsSection title="Layout">
      <Field>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <Input
          id={nameId}
          value={merged.name}
          placeholder="Element name"
          maxLength={80}
          onChange={(event) => update({ name: event.target.value })}
        />
      </Field>
      <SettingsRow>
        <AlignGroup
          label="Align horizontally to slide"
          options={HORIZONTAL}
          onAlign={(alignment) => update(alignToSlide(merged, alignment))}
        />
        <AlignGroup
          label="Align vertically to slide"
          options={VERTICAL}
          onAlign={(alignment) => update(alignToSlide(merged, alignment))}
        />
      </SettingsRow>
      <SettingsRow>
        <NumberSetting
          label="X"
          prefix="X"
          value={merged.x}
          onChange={(x) => update({ x })}
        />
        <NumberSetting
          label="Y"
          prefix="Y"
          value={merged.y}
          onChange={(y) => update({ y })}
        />
      </SettingsRow>
      {resizable && (
        <SettingsRow>
          <NumberSetting
            label="Width"
            prefix="W"
            value={merged.width}
            min={MIN_ELEMENT_SIZE}
            onChange={(width) => update({ width })}
          />
          <NumberSetting
            label="Height"
            prefix="H"
            value={merged.height}
            min={MIN_ELEMENT_SIZE}
            disabled={autoHeight}
            onChange={(height) => update({ height })}
          />
        </SettingsRow>
      )}
      <SettingsRow>
        <NumberSetting
          label="Rotation"
          prefix={<RotateCwIcon />}
          value={merged.rotation}
          min={-180}
          max={180}
          onChange={(rotation) => update({ rotation })}
        />
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          multiple
          aria-label="Flip"
          value={[
            ...(merged.flipX ? ["flipX"] : []),
            ...(merged.flipY ? ["flipY"] : []),
          ]}
          onValueChange={(value) =>
            update({
              flipX: value.includes("flipX"),
              flipY: value.includes("flipY"),
            })
          }
        >
          <ToggleGroupItem
            value="flipX"
            aria-label="Flip horizontally"
            className="flex-1"
          >
            <FlipHorizontal2Icon />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="flipY"
            aria-label="Flip vertically"
            className="flex-1"
          >
            <FlipVertical2Icon />
          </ToggleGroupItem>
        </ToggleGroup>
      </SettingsRow>
    </SettingsSection>
  )
}

export { TransformSettings }
