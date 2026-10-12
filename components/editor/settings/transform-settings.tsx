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
import type { ElementTransformProps } from "@/lib/editor/types"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
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
  SliderSetting,
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

function ShadowSetting({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = React.useId()
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>Shadow</FieldLabel>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Field>
  )
}

function TransformSettings({
  props,
  update,
  autoHeight,
}: {
  props: ElementTransformProps
  update: (patch: Partial<ElementTransformProps>) => void
  autoHeight?: boolean
}) {
  return (
    <SettingsSection title="Layout">
      <SettingsRow>
        <AlignGroup
          label="Align horizontally to slide"
          options={HORIZONTAL}
          onAlign={(alignment) => update(alignToSlide(props, alignment))}
        />
        <AlignGroup
          label="Align vertically to slide"
          options={VERTICAL}
          onAlign={(alignment) => update(alignToSlide(props, alignment))}
        />
      </SettingsRow>
      <SettingsRow>
        <NumberSetting
          label="X"
          prefix="X"
          value={props.x}
          onChange={(x) => update({ x })}
        />
        <NumberSetting
          label="Y"
          prefix="Y"
          value={props.y}
          onChange={(y) => update({ y })}
        />
      </SettingsRow>
      <SettingsRow>
        <NumberSetting
          label="Width"
          prefix="W"
          value={props.width}
          min={16}
          onChange={(width) => update({ width })}
        />
        <NumberSetting
          label="Height"
          prefix="H"
          value={props.height}
          min={16}
          disabled={autoHeight}
          onChange={(height) => update({ height })}
        />
      </SettingsRow>
      <SettingsRow>
        <NumberSetting
          label="Rotation"
          prefix={<RotateCwIcon />}
          value={props.rotation}
          suffix="°"
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
            ...(props.flipX ? ["flipX"] : []),
            ...(props.flipY ? ["flipY"] : []),
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
      <ShadowSetting
        checked={props.shadow}
        onChange={(shadow) => update({ shadow })}
      />
      <SliderSetting
        label="Opacity"
        value={Math.round(props.opacity * 100)}
        format={(v) => `${v}%`}
        onChange={(v) => update({ opacity: v / 100 })}
      />
    </SettingsSection>
  )
}

export { TransformSettings }
