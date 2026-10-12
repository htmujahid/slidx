"use client"

import { resolveShapeParams, SHAPES_BY_KIND } from "@/lib/editor/shapes"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ShapeProps } from "@/components/editor/nodes/shape"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
  SliderSetting,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function ShapeSettings() {
  const { props, update } = useNodeProps<ShapeProps>()
  const definition = SHAPES_BY_KIND[props.kind]
  const gradient = definition.filled && props.fillType === "gradient"
  const values = resolveShapeParams(definition, props.params, {
    cornerRadius: props.cornerRadius,
  })

  return (
    <>
      <TransformSettings props={props} update={update} />
      {definition.params?.length ? (
        <SettingsSection title="Shape">
          {definition.params.map((param) => (
            <SliderSetting
              key={param.key}
              label={param.label}
              value={values[param.key]}
              min={param.min}
              max={param.max}
              step={param.step}
              format={(value) => `${value}${param.unit ?? ""}`}
              onChange={(value) =>
                update({ params: { ...props.params, [param.key]: value } })
              }
            />
          ))}
        </SettingsSection>
      ) : null}
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
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              className="w-full"
              aria-label="Gradient type"
              value={[props.gradientType ?? "linear"]}
              onValueChange={([gradientType]) => {
                if (gradientType)
                  update({
                    gradientType: gradientType as ShapeProps["gradientType"],
                  })
              }}
            >
              <ToggleGroupItem value="linear" className="flex-1">
                Linear
              </ToggleGroupItem>
              <ToggleGroupItem value="radial" className="flex-1">
                Radial
              </ToggleGroupItem>
            </ToggleGroup>
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
            {props.gradientType !== "radial" && (
              <NumberSetting
                label="Angle"
                value={props.gradientAngle}
                min={0}
                max={360}
                onChange={(gradientAngle) => update({ gradientAngle })}
              />
            )}
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
            <NumberSetting
              label="Stroke width"
              value={props.strokeWidth}
              min={0}
              max={64}
              onChange={(strokeWidth) => update({ strokeWidth })}
            />
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
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          className="w-full"
          aria-label="Stroke style"
          value={[props.dashStyle ?? "solid"]}
          onValueChange={([dashStyle]) => {
            if (dashStyle)
              update({ dashStyle: dashStyle as ShapeProps["dashStyle"] })
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
      </SettingsSection>
      {definition.filled ? (
        <SettingsSection title="Text">
          <SettingsRow>
            <ColorSetting
              label="Color"
              value={props.textColor ?? "#ffffff"}
              onChange={(textColor) => update({ textColor })}
            />
            <NumberSetting
              label="Size"
              value={props.textSize ?? 32}
              min={8}
              max={200}
              onChange={(textSize) => update({ textSize })}
            />
          </SettingsRow>
        </SettingsSection>
      ) : null}
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { ShapeSettings }
