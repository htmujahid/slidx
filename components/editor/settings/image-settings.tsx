"use client"

import * as React from "react"

import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { ImageBoxProps } from "@/components/editor/nodes/image-box"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { ImageFitSetting } from "@/components/editor/settings/image-fit-setting"
import { ImageSource } from "@/components/editor/settings/image-source"
import { NumberSetting } from "@/components/editor/settings/number-setting"
import { SettingsRow } from "@/components/editor/settings/settings-row"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { SliderSetting } from "@/components/editor/settings/slider-setting"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

const MASK_KINDS = (
  Object.entries(SHAPES_BY_KIND) as Array<
    [ShapeKind, (typeof SHAPES_BY_KIND)[ShapeKind]]
  >
).filter(([, definition]) => definition.filled)

function ImageSettings() {
  const { props, update } = useNodeProps<ImageBoxProps>()
  const cropped = props.zoom > 1
  const masked = Boolean(props.mask && props.mask !== "none")
  const maskId = React.useId()
  const altId = React.useId()

  return (
    <>
      <SettingsSection title="Image">
        <ImageSource
          label="Source"
          value={props.src}
          onChange={(src) => update({ src })}
        />
        <ImageFitSetting
          value={props.fit}
          onChange={(fit) => update({ fit })}
        />
        <Field>
          <FieldLabel htmlFor={maskId}>Mask shape</FieldLabel>
          <NativeSelect
            id={maskId}
            className="w-full"
            value={props.mask ?? "none"}
            onChange={(event) =>
              update({ mask: event.target.value as ImageBoxProps["mask"] })
            }
          >
            <NativeSelectOption value="none">None</NativeSelectOption>
            {MASK_KINDS.map(([kind, definition]) => (
              <NativeSelectOption key={kind} value={kind}>
                {definition.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        {!masked && (
          <NumberSetting
            label="Corner radius"
            value={props.cornerRadius}
            min={0}
            max={400}
            onChange={(cornerRadius) => update({ cornerRadius })}
          />
        )}
        <Field>
          <FieldLabel htmlFor={altId}>Alt text</FieldLabel>
          <Input
            id={altId}
            value={props.alt ?? ""}
            placeholder="Describe the image"
            maxLength={200}
            onChange={(event) => update({ alt: event.target.value })}
          />
        </Field>
        <SliderSetting
          label="Crop zoom"
          value={Math.round(props.zoom * 100)}
          min={100}
          max={300}
          step={5}
          format={(v) => `${v}%`}
          onChange={(v) => update({ zoom: v / 100 })}
        />
        {cropped ? (
          <SettingsRow>
            <SliderSetting
              label="Position X"
              value={props.focusX}
              format={(v) => `${v}%`}
              onChange={(focusX) => update({ focusX })}
            />
            <SliderSetting
              label="Position Y"
              value={props.focusY}
              format={(v) => `${v}%`}
              onChange={(focusY) => update({ focusY })}
            />
          </SettingsRow>
        ) : null}
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { ImageSettings }
