"use client"

import * as React from "react"

import { CODE_LANGUAGES, measureCodeHeight } from "@/lib/editor/code"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import type { CodeBlockProps } from "@/components/editor/nodes/code-block"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { SettingsSection } from "@/components/editor/settings/settings-section"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

const deriveHeight = (props: CodeBlockProps) => ({
  height: measureCodeHeight(props.code, props.header),
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
        <Field orientation="horizontal">
          <FieldLabel htmlFor={`${id}-numbers`}>Line numbers</FieldLabel>
          <Switch
            id={`${id}-numbers`}
            checked={props.lineNumbers}
            onCheckedChange={(lineNumbers) => update({ lineNumbers })}
          />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor={`${id}-wrap`}>Wrap lines</FieldLabel>
          <Switch
            id={`${id}-wrap`}
            checked={props.wrap}
            onCheckedChange={(wrap) => update({ wrap })}
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
      <SettingsSection title="Header">
        <Field orientation="horizontal">
          <FieldLabel htmlFor={`${id}-header`}>Show header</FieldLabel>
          <Switch
            id={`${id}-header`}
            checked={props.header}
            onCheckedChange={(header) => update({ header })}
          />
        </Field>
        {props.header ? (
          <>
            <Field>
              <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
              <Input
                id={`${id}-title`}
                placeholder="greet.ts"
                value={props.title}
                onChange={(event) => update({ title: event.target.value })}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={`${id}-showWrap`}>Wrap button</FieldLabel>
              <Switch
                id={`${id}-showWrap`}
                checked={props.showWrap}
                onCheckedChange={(showWrap) => update({ showWrap })}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={`${id}-showDownload`}>
                Download button
              </FieldLabel>
              <Switch
                id={`${id}-showDownload`}
                checked={props.showDownload}
                onCheckedChange={(showDownload) => update({ showDownload })}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={`${id}-show-copy`}>Copy button</FieldLabel>
              <Switch
                id={`${id}-show-copy`}
                checked={props.showCopy}
                onCheckedChange={(showCopy) => update({ showCopy })}
              />
            </Field>
          </>
        ) : null}
      </SettingsSection>
      <TransformSettings props={props} update={update} autoHeight />
      <EffectsSettings props={props} update={update} />
    </>
  )
}

export { CodeSettings }
