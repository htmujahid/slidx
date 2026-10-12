"use client"

import * as React from "react"
import { UngroupIcon } from "lucide-react"

import { useEditorActions } from "@/hooks/use-editor-actions"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Kbd } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import type { GroupProps } from "@/components/editor/nodes/group"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { SettingsSection } from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function GroupSettings() {
  const { props, update } = useNodeProps<GroupProps>()
  const { ungroup } = useEditorActions()
  const isolateId = React.useId()

  return (
    <>
      <SettingsSection title="Group">
        <Field orientation="horizontal">
          <FieldLabel htmlFor={isolateId}>Isolate blending</FieldLabel>
          <Switch
            id={isolateId}
            checked={props.isolate ?? true}
            onCheckedChange={(isolate) => update({ isolate })}
          />
        </Field>
        <Button variant="outline" size="sm" onClick={() => ungroup()}>
          <UngroupIcon data-icon="inline-start" />
          Ungroup
          <Kbd className="ml-auto">⇧⌘G</Kbd>
        </Button>
      </SettingsSection>
      <TransformSettings props={props} update={update} resizable={false} />
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { GroupSettings }
