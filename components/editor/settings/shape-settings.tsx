"use client"

import { SHAPES_BY_KIND } from "@/lib/editor/shapes"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ShapeProps } from "@/components/editor/nodes/shape"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function ShapeSettings() {
  const { props, update } = useNodeProps<ShapeProps>()
  const definition = SHAPES_BY_KIND[props.kind]
  const gradient = definition.filled && props.fillType === "gradient"

  return (
    <>
      <TransformSettings props={props} update={update} />
      <SettingsSection title="Appearance">
        {definition.filled ? (
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            className="w-full"
            aria-label="Fill type"
            value={[props.fillType]}
            onValueChange={([fillType]) => {
              if (fillType)
                update({ fillType: fillType as ShapeProps["fillType"] })
            }}
          >
            <ToggleGroupItem value="solid" className="flex-1">
              Solid
            </ToggleGroupItem>
            <ToggleGroupItem value="gradient" className="flex-1">
              Gradient
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
        {gradient ? (
          <>
            <SettingsRow>
              <ColorSetting
                label="From"
                value={props.fill}
                onChange={(fill) => update({ fill })}
              />
              <ColorSetting
                label="To"
                value={props.fill2}
                onChange={(fill2) => update({ fill2 })}
              />
            </SettingsRow>
            <NumberSetting
              label="Angle"
              value={props.gradientAngle}
              suffix="°"
              min={0}
              max={360}
              onChange={(gradientAngle) => update({ gradientAngle })}
            />
          </>
        ) : (
          <ColorSetting
            label={definition.filled ? "Fill" : "Color"}
            value={props.fill}
            onChange={(fill) => update({ fill })}
          />
        )}
        {definition.filled ? (
          <>
            <ColorSetting
              label="Stroke"
              value={props.stroke}
              onChange={(stroke) => update({ stroke })}
            />
            <SettingsRow>
              <NumberSetting
                label="Stroke width"
                value={props.strokeWidth}
                min={0}
                max={64}
                onChange={(strokeWidth) => update({ strokeWidth })}
              />
              {props.kind === "rectangle" ? (
                <NumberSetting
                  label="Radius"
                  value={props.cornerRadius}
                  min={0}
                  onChange={(cornerRadius) => update({ cornerRadius })}
                />
              ) : null}
            </SettingsRow>
          </>
        ) : (
          <NumberSetting
            label="Thickness"
            value={props.strokeWidth}
            min={1}
            max={64}
            onChange={(strokeWidth) => update({ strokeWidth })}
          />
        )}
      </SettingsSection>
    </>
  )
}

export { ShapeSettings }
