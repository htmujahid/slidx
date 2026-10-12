"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import { ArrowLeftRightIcon } from "lucide-react"

import {
  SLIDE_DEFAULTS,
  type BackgroundType,
  type GradientType,
  type SlideProps,
} from "@/lib/editor/slide-props"
import { SLIDE_TEMPLATES, type SlideTemplate } from "@/lib/editor/templates"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
  SliderSetting,
} from "@/components/editor/settings/fields"
import {
  ImageFitSetting,
  ImageSource,
} from "@/components/editor/settings/image-source"
import { useNodeProps } from "@/components/editor/settings/use-node-props"
import { TemplatePreview } from "@/components/editor/template-preview"

function SwitchSetting({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = React.useId()
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Field>
  )
}

function ImageBackgroundSettings({
  props,
  update,
}: {
  props: SlideProps
  update: (patch: Partial<SlideProps>) => void
}) {
  return (
    <>
      <ImageSource
        value={props.backgroundImage}
        onChange={(backgroundImage) => update({ backgroundImage })}
      />
      <ImageFitSetting
        value={props.imageFit}
        onChange={(imageFit) => update({ imageFit })}
      />
    </>
  )
}

function LayoutSettings() {
  const { actions, query } = useEditor()

  const apply = (template: SlideTemplate) => {
    const current = JSON.parse(query.serialize())
    const next = JSON.parse(template.json)
    next[ROOT_NODE].props = current[ROOT_NODE].props
    actions.deserialize(JSON.stringify(next))
  }

  return (
    <SettingsSection title="Slide layout">
      <div className="grid grid-cols-2 gap-2">
        {SLIDE_TEMPLATES.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="h-auto flex-col gap-1.5 py-2"
            onClick={() => apply(template)}
          >
            <TemplatePreview
              template={template}
              className="size-auto w-full text-muted-foreground"
            />
            <span className="text-xs font-normal">{template.label}</span>
          </Button>
        ))}
      </div>
      <FieldDescription>
        Applying a layout replaces the slide’s contents.
      </FieldDescription>
    </SettingsSection>
  )
}

function GradientSettings({
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

function SlideSettings() {
  const { props: stored, update } = useNodeProps<SlideProps>()
  const props = {
    ...SLIDE_DEFAULTS,
    ...stored,
    backgroundType:
      stored.backgroundType === "image" || stored.backgroundType === "gradient"
        ? stored.backgroundType
        : "solid",
  } satisfies SlideProps

  return (
    <>
      <LayoutSettings />
      <SettingsSection title="Background">
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Background type"
          className="w-full"
          value={[props.backgroundType]}
          onValueChange={([type]) => {
            if (type) update({ backgroundType: type as BackgroundType })
          }}
        >
          <ToggleGroupItem value="solid" className="flex-1">
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem value="gradient" className="flex-1">
            Gradient
          </ToggleGroupItem>
          <ToggleGroupItem value="image" className="flex-1">
            Image
          </ToggleGroupItem>
        </ToggleGroup>

        {props.backgroundType === "solid" ? (
          <ColorSetting
            label="Color"
            value={props.background}
            onChange={(background) => update({ background })}
          />
        ) : null}

        {props.backgroundType === "gradient" ? (
          <GradientSettings props={props} update={update} />
        ) : null}

        {props.backgroundType === "image" ? (
          <>
            <ColorSetting
              label="Fallback color"
              value={props.background}
              onChange={(background) => update({ background })}
            />
            <ImageBackgroundSettings props={props} update={update} />
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Canvas">
        <SwitchSetting
          label="Snap to alignment"
          checked={props.snapToAlignment}
          onChange={(snapToAlignment) => update({ snapToAlignment })}
        />
        <SwitchSetting
          label="Show grid"
          checked={props.showGrid}
          onChange={(showGrid) => update({ showGrid })}
        />
        <SwitchSetting
          label="Snap to grid"
          checked={props.snapToGrid}
          onChange={(snapToGrid) => update({ snapToGrid })}
        />
        <NumberSetting
          label="Grid size"
          value={props.gridSize}
          min={8}
          max={400}
          onChange={(gridSize) => update({ gridSize })}
        />
      </SettingsSection>
    </>
  )
}

export { SlideSettings }
