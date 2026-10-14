"use client"

import { IconPicker } from "@/components/editor/icon-picker"
import type { IconBoxProps } from "@/components/editor/nodes/icon-box"
import { ColorSetting } from "@/components/editor/settings/color-setting"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { SliderSetting } from "@/components/editor/settings/slider-setting"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function IconSettings() {
  const { props, update } = useNodeProps<IconBoxProps>()

  return (
    <>
      <SettingsSection title="Icon">
        <IconPicker value={props.icon} onChange={(icon) => update({ icon })} />
        <ColorSetting
          label="Color"
          value={props.color}
          onChange={(color) => update({ color })}
        />
        <SliderSetting
          label="Stroke width"
          value={props.strokeWidth}
          min={0.5}
          max={4}
          step={0.25}
          onChange={(strokeWidth) => update({ strokeWidth })}
        />
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { IconSettings }
