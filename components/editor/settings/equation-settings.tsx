"use client"

import { FieldDescription } from "@/components/ui/field"
import type { EquationProps } from "@/components/editor/nodes/equation"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  ColorSetting,
  NumberSetting,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function EquationSettings() {
  const { props, update } = useNodeProps<EquationProps>()

  return (
    <>
      <SettingsSection title="Equation">
        <FieldDescription>
          Double-click the equation on the slide (or select it and press Enter)
          to edit.
        </FieldDescription>
        <NumberSetting
          label="Font size"
          value={props.fontSize}
          min={12}
          max={400}
          onChange={(fontSize) => update({ fontSize })}
        />
        <ColorSetting
          label="Color"
          value={props.fill}
          onChange={(fill) => update({ fill })}
        />
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { EquationSettings }
