"use client"

import type { ImageBoxProps } from "@/components/editor/nodes/image-box"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  NumberSetting,
  SettingsRow,
  SettingsSection,
  SliderSetting,
} from "@/components/editor/settings/fields"
import {
  ImageFitSetting,
  ImageSource,
} from "@/components/editor/settings/image-source"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function ImageSettings() {
  const { props, update } = useNodeProps<ImageBoxProps>()
  const cropped = props.zoom > 1

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
        <NumberSetting
          label="Corner radius"
          value={props.cornerRadius}
          min={0}
          max={400}
          onChange={(cornerRadius) => update({ cornerRadius })}
        />
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
