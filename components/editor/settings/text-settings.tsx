"use client"

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
} from "lucide-react"

import { FONT_FAMILIES } from "@/lib/editor/constants"
import type { TextAlign } from "@/lib/editor/types"
import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TextBoxProps } from "@/components/editor/nodes/text-box"
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
  const style = [
    props.fontWeight >= 600 ? "bold" : null,
    props.fontStyle === "italic" ? "italic" : null,
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
              })
            }
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <ItalicIcon />
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
          </ToggleGroup>
        </div>
        <ColorSetting
          label="Color"
          value={props.fill}
          onChange={(fill) => update({ fill })}
        />
      </SettingsSection>
      <TransformSettings props={props} update={update} autoHeight />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { TextSettings }
