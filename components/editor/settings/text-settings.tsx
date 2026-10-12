"use client"

import * as React from "react"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react"

import { FONT_FAMILIES } from "@/lib/editor/constants"
import type { TextAlign } from "@/lib/editor/types"
import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TextBoxProps } from "@/components/editor/nodes/text-box"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function TextSettings() {
  const { props, update } = useNodeProps<TextBoxProps>()
  const backgroundId = React.useId()
  const style = [
    props.fontWeight >= 600 ? "bold" : null,
    props.fontStyle === "italic" ? "italic" : null,
    props.underline ? "underline" : null,
    props.strikethrough ? "strikethrough" : null,
  ].filter((value): value is string => value !== null)

  return (
    <>
      <SettingsSection title="Text">
        <Field>
          <FieldLabel htmlFor="text-font">Font</FieldLabel>
          <NativeSelect
            id="text-font"
            className="w-full"
            value={props.fontFamily}
            onChange={(event) => update({ fontFamily: event.target.value })}
          >
            {FONT_FAMILIES.map((font) => (
              <NativeSelectOption key={font.label} value={font.value}>
                {font.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <SettingsRow>
          <NumberSetting
            label="Size"
            value={props.fontSize}
            min={8}
            max={400}
            onChange={(fontSize) => update({ fontSize })}
          />
          <NumberSetting
            label="Line height"
            value={props.lineHeight}
            min={0.8}
            max={3}
            step={0.1}
            onChange={(lineHeight) => update({ lineHeight })}
          />
        </SettingsRow>
        <div className="flex items-center justify-between gap-2">
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Font style"
            multiple
            value={style}
            onValueChange={(next) =>
              update({
                fontWeight: next.includes("bold") ? 700 : 400,
                fontStyle: next.includes("italic") ? "italic" : "normal",
                underline: next.includes("underline"),
                strikethrough: next.includes("strikethrough"),
              })
            }
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <UnderlineIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="strikethrough" aria-label="Strikethrough">
              <StrikethroughIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Text alignment"
            value={[props.align]}
            onValueChange={([align]) => {
              if (align) update({ align: align as TextAlign })
            }}
          >
            <ToggleGroupItem value="left" aria-label="Align left">
              <AlignLeftIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
              <AlignCenterIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <AlignRightIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="justify" aria-label="Justify">
              <AlignJustifyIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ColorSetting
          label="Color"
          value={props.fill}
          onChange={(fill) => update({ fill })}
        />
        <SettingsRow>
          <NumberSetting
            label="Letter spacing"
            value={props.letterSpacing ?? 0}
            min={-5}
            max={50}
            step={0.5}
            onChange={(letterSpacing) => update({ letterSpacing })}
          />
          <NumberSetting
            label="Padding"
            value={props.padding ?? 0}
            min={0}
            max={200}
            onChange={(padding) => update({ padding })}
          />
        </SettingsRow>
        <Field orientation="horizontal">
          <FieldLabel htmlFor={backgroundId}>Background</FieldLabel>
          <Switch
            id={backgroundId}
            checked={Boolean(props.background)}
            onCheckedChange={(checked) =>
              update({ background: checked ? "#fef9c3" : "" })
            }
          />
        </Field>
        {props.background ? (
          <ColorSetting
            label="Background color"
            value={props.background}
            onChange={(background) => update({ background })}
          />
        ) : null}
      </SettingsSection>
      <TransformSettings props={props} update={update} autoHeight />
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { TextSettings }
