"use client"

import * as React from "react"

import { CHART_KINDS, type ChartKind } from "@/lib/editor/chart"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import type { ChartBoxProps } from "@/components/editor/nodes/chart-box"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function OptionSwitch({
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

function ChartSettings() {
  const { props, update } = useNodeProps<ChartBoxProps>()
  const id = React.useId()
  const { kind } = props
  const isPie = kind === "pie"
  const canStack =
    kind === "bar" || kind === "bar-horizontal" || kind === "area"

  return (
    <>
      <SettingsSection title="Chart">
        <FieldDescription>
          Double-click the chart on the slide (or select it and press Enter) to
          edit its data.
        </FieldDescription>
        <Field>
          <FieldLabel htmlFor={`${id}-kind`}>Type</FieldLabel>
          <NativeSelect
            id={`${id}-kind`}
            className="w-full"
            value={kind}
            onChange={(event) =>
              update({ kind: event.target.value as ChartKind })
            }
          >
            {CHART_KINDS.map((entry) => (
              <NativeSelectOption key={entry.kind} value={entry.kind}>
                {entry.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        {canStack ? (
          <OptionSwitch
            label="Stacked"
            checked={props.stacked}
            onChange={(stacked) => update({ stacked })}
          />
        ) : null}
        {isPie ? (
          <OptionSwitch
            label="Donut"
            checked={props.donut}
            onChange={(donut) => update({ donut })}
          />
        ) : null}
        <OptionSwitch
          label="Legend"
          checked={props.showLegend}
          onChange={(showLegend) => update({ showLegend })}
        />
        {!isPie ? (
          <OptionSwitch
            label="Grid"
            checked={props.showGrid}
            onChange={(showGrid) => update({ showGrid })}
          />
        ) : null}
        {kind !== "radar" ? (
          <OptionSwitch
            label="Value labels"
            checked={props.showValues}
            onChange={(showValues) => update({ showValues })}
          />
        ) : null}
      </SettingsSection>

      <SettingsSection title="Style">
        <NumberSetting
          label="Font size"
          value={props.fontSize}
          min={12}
          max={72}
          onChange={(fontSize) => update({ fontSize })}
        />
        <SettingsRow>
          <ColorSetting
            label="Text"
            value={props.textColor}
            onChange={(textColor) => update({ textColor })}
          />
          <ColorSetting
            label="Grid"
            value={props.gridColor}
            onChange={(gridColor) => update({ gridColor })}
          />
        </SettingsRow>
      </SettingsSection>

      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { ChartSettings }
