"use client"

import * as React from "react"

import { CHART_KINDS, type ChartKind } from "@/lib/editor/chart"
import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { ChartBoxProps } from "@/components/editor/nodes/chart-box"
import { ColorSetting } from "@/components/editor/settings/color-setting"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { NumberSetting } from "@/components/editor/settings/number-setting"
import { SettingsRow } from "@/components/editor/settings/settings-row"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { SwitchSetting } from "@/components/editor/settings/switch-setting"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

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
          <SwitchSetting
            label="Stacked"
            checked={props.stacked}
            onChange={(stacked) => update({ stacked })}
          />
        ) : null}
        {isPie ? (
          <SwitchSetting
            label="Donut"
            checked={props.donut}
            onChange={(donut) => update({ donut })}
          />
        ) : null}
        <SwitchSetting
          label="Legend"
          checked={props.showLegend}
          onChange={(showLegend) => update({ showLegend })}
        />
        {!isPie ? (
          <SwitchSetting
            label="Grid"
            checked={props.showGrid}
            onChange={(showGrid) => update({ showGrid })}
          />
        ) : null}
        {kind !== "radar" ? (
          <SwitchSetting
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
        {props.series.map((series, index) => (
          <ColorSetting
            key={index}
            label={series.name || `Series ${index + 1}`}
            value={series.color}
            onChange={(color) =>
              update({
                series: props.series.map((entry, i) =>
                  i === index ? { ...entry, color } : entry
                ),
              })
            }
          />
        ))}
      </SettingsSection>

      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { ChartSettings }
