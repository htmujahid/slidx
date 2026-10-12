"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ArrowLineProps } from "@/components/editor/nodes/arrow-line"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  ColorSetting,
  NumberSetting,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function ArrowSwitch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = React.useId()
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Field>
  )
}

function ArrowLineSettings() {
  const { props, update } = useNodeProps<ArrowLineProps>()

  return (
    <>
      <SettingsSection title="Arrow">
        <ColorSetting
          label="Color"
          value={props.color}
          onChange={(color) => update({ color })}
        />
        <NumberSetting
          label="Thickness"
          value={props.strokeWidth}
          min={1}
          max={32}
          onChange={(strokeWidth) => update({ strokeWidth })}
        />
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          className="w-full"
          aria-label="Stroke style"
          value={[props.dashStyle ?? "solid"]}
          onValueChange={([dashStyle]) => {
            if (dashStyle)
              update({ dashStyle: dashStyle as ArrowLineProps["dashStyle"] })
          }}
        >
          <ToggleGroupItem value="solid" className="flex-1">
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem value="dashed" className="flex-1">
            Dashed
          </ToggleGroupItem>
          <ToggleGroupItem value="dotted" className="flex-1">
            Dotted
          </ToggleGroupItem>
        </ToggleGroup>
        <ArrowSwitch
          label="Arrow at start"
          checked={props.arrowStart}
          onChange={(arrowStart) => update({ arrowStart })}
        />
        <ArrowSwitch
          label="Arrow at end"
          checked={props.arrowEnd}
          onChange={(arrowEnd) => update({ arrowEnd })}
        />
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { ArrowLineSettings }
