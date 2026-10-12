"use client"

import * as React from "react"

import {
  BLEND_MODES,
  DEFAULT_TRANSFORM,
  type BlendMode,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
  SliderSetting,
} from "@/components/editor/settings/fields"

const blendModeLabel = (mode: BlendMode) =>
  (mode.charAt(0).toUpperCase() + mode.slice(1)).replace("-", " ")

function EffectsSettings({
  props,
  update,
}: {
  props: Partial<ElementTransformProps>
  update: (patch: Partial<ElementTransformProps>) => void
}) {
  const merged = { ...DEFAULT_TRANSFORM, ...props }
  const blendId = React.useId()
  const shadowId = React.useId()

  return (
    <SettingsSection title="Effects">
      <SliderSetting
        label="Opacity"
        value={Math.round(merged.opacity * 100)}
        format={(v) => `${v}%`}
        onChange={(v) => update({ opacity: v / 100 })}
      />
      <Field>
        <FieldLabel htmlFor={blendId}>Blend mode</FieldLabel>
        <NativeSelect
          id={blendId}
          className="w-full"
          value={merged.blendMode}
          onChange={(event) =>
            update({ blendMode: event.target.value as BlendMode })
          }
        >
          {BLEND_MODES.map((mode) => (
            <NativeSelectOption key={mode} value={mode}>
              {blendModeLabel(mode)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <SliderSetting
        label="Blur"
        value={merged.blur}
        min={0}
        max={40}
        format={(v) => `${v}px`}
        onChange={(blur) => update({ blur })}
      />
      <SliderSetting
        label="Brightness"
        value={merged.brightness}
        min={0}
        max={200}
        format={(v) => `${v}%`}
        onChange={(brightness) => update({ brightness })}
      />
      <SliderSetting
        label="Grayscale"
        value={merged.grayscale}
        min={0}
        max={100}
        format={(v) => `${v}%`}
        onChange={(grayscale) => update({ grayscale })}
      />
      <Field orientation="horizontal">
        <FieldLabel htmlFor={shadowId}>Shadow</FieldLabel>
        <Switch
          id={shadowId}
          checked={merged.shadow}
          onCheckedChange={(shadow) => update({ shadow })}
        />
      </Field>
      {merged.shadow && (
        <>
          <ColorSetting
            label="Shadow color"
            value={merged.shadowColor}
            onChange={(shadowColor) => update({ shadowColor })}
          />
          <SliderSetting
            label="Shadow opacity"
            value={Math.round(merged.shadowOpacity * 100)}
            format={(v) => `${v}%`}
            onChange={(v) => update({ shadowOpacity: v / 100 })}
          />
          <SliderSetting
            label="Shadow blur"
            value={merged.shadowBlur}
            min={0}
            max={100}
            format={(v) => `${v}px`}
            onChange={(shadowBlur) => update({ shadowBlur })}
          />
          <SettingsRow>
            <NumberSetting
              label="Shadow offset X"
              prefix="X"
              value={merged.shadowOffsetX}
              min={-100}
              max={100}
              onChange={(shadowOffsetX) => update({ shadowOffsetX })}
            />
            <NumberSetting
              label="Shadow offset Y"
              prefix="Y"
              value={merged.shadowOffsetY}
              min={-100}
              max={100}
              onChange={(shadowOffsetY) => update({ shadowOffsetY })}
            />
          </SettingsRow>
        </>
      )}
    </SettingsSection>
  )
}

export { EffectsSettings }
