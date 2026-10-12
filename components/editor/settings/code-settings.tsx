"use client"

import * as React from "react"

import {
  CODE_LANGUAGES,
  CODE_THEMES,
  measureCodeHeight,
} from "@/lib/editor/code"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import type { CodeBlockProps } from "@/components/editor/nodes/code-block"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import {
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

const deriveHeight = (props: CodeBlockProps) => ({
  height: measureCodeHeight(props.code, props.fontSize),
})

function CodeSettings() {
  const { props, update } = useNodeProps<CodeBlockProps>(deriveHeight)
  const id = React.useId()

  return (
    <>
      <SettingsSection title="Code">
        <Field>
          <FieldLabel htmlFor={`${id}-language`}>Language</FieldLabel>
          <NativeSelect
            id={`${id}-language`}
            className="w-full"
            value={props.language}
            onChange={(event) =>
              update({
                language: event.target.value as typeof props.language,
              })
            }
          >
            {CODE_LANGUAGES.map((language) => (
              <NativeSelectOption key={language.value} value={language.value}>
                {language.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-theme`}>Theme</FieldLabel>
          <NativeSelect
            id={`${id}-theme`}
            className="w-full"
            value={props.theme}
            onChange={(event) =>
              update({ theme: event.target.value as typeof props.theme })
            }
          >
            {(["light", "dark"] as const).map((mode) => (
              <NativeSelectOptGroup
                key={mode}
                label={mode === "light" ? "Light" : "Dark"}
              >
                {CODE_THEMES.filter((theme) => theme.mode === mode).map(
                  (theme) => (
                    <NativeSelectOption key={theme.value} value={theme.value}>
                      {theme.label}
                    </NativeSelectOption>
                  )
                )}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        </Field>
        <SettingsRow>
          <NumberSetting
            label="Font size"
            value={props.fontSize}
            min={10}
            max={120}
            onChange={(fontSize) => update({ fontSize })}
          />
          <NumberSetting
            label="Radius"
            value={props.cornerRadius}
            min={0}
            max={120}
            onChange={(cornerRadius) => update({ cornerRadius })}
          />
        </SettingsRow>
        <Field orientation="horizontal">
          <FieldLabel htmlFor={`${id}-numbers`}>Line numbers</FieldLabel>
          <Switch
            id={`${id}-numbers`}
            checked={props.lineNumbers}
            onCheckedChange={(lineNumbers) => update({ lineNumbers })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-highlight`}>Highlight lines</FieldLabel>
          <Input
            id={`${id}-highlight`}
            placeholder="2, 4-6"
            value={props.highlightLines}
            onChange={(event) => update({ highlightLines: event.target.value })}
          />
          <FieldDescription>
            Line numbers or ranges, comma separated.
          </FieldDescription>
        </Field>
      </SettingsSection>
      <TransformSettings props={props} update={update} autoHeight />
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { CodeSettings }
