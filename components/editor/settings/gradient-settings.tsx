"use client"

import { ArrowLeftRightIcon } from "lucide-react"

import { type GradientType, type SlideProps } from "@/lib/editor/slide-props"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ColorSetting } from "@/components/editor/settings/color-setting"
import { SettingsRow } from "@/components/editor/settings/settings-row"
import { SliderSetting } from "@/components/editor/settings/slider-setting"

export function GradientSettings({
  props,
  update,
}: {
  props: SlideProps
  update: (patch: Partial<SlideProps>) => void
}) {
  return (
    <>
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Gradient type"
        className="w-full"
        value={[props.gradientType]}
        onValueChange={([gradientType]) => {
          if (gradientType)
            update({ gradientType: gradientType as GradientType })
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
          value={props.gradientFrom}
          onChange={(gradientFrom) => update({ gradientFrom })}
        />
        <ColorSetting
          label="To"
          value={props.gradientTo}
          onChange={(gradientTo) => update({ gradientTo })}
        />
      </SettingsRow>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          update({
            gradientFrom: props.gradientTo,
            gradientTo: props.gradientFrom,
          })
        }
      >
        <ArrowLeftRightIcon data-icon="inline-start" />
        Swap colors
      </Button>
      {props.gradientType === "linear" ? (
        <SliderSetting
          label="Angle"
          value={props.gradientAngle}
          min={0}
          max={360}
          format={(value) => `${value}°`}
          onChange={(gradientAngle) => update({ gradientAngle })}
        />
      ) : null}
    </>
  )
}
