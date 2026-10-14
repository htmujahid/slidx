"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ArrowLineProps } from "@/components/editor/nodes/arrow-line"
import { ColorSetting } from "@/components/editor/settings/color-setting"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { NumberSetting } from "@/components/editor/settings/number-setting"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { SwitchSetting } from "@/components/editor/settings/switch-setting"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

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
        <SwitchSetting
          label="Arrow at start"
          checked={props.arrowStart}
          onChange={(arrowStart) => update({ arrowStart })}
        />
        <SwitchSetting
          label="Arrow at end"
          checked={props.arrowEnd}
          onChange={(arrowEnd) => update({ arrowEnd })}
        />
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { ArrowLineSettings }
