"use client"

import * as React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { PlayIcon } from "lucide-react"

import {
  DEFAULT_ANIMATION,
  EASINGS,
  isEmphasis,
  presetsFor,
  TRIGGERS,
  type AnimationEasing,
  type AnimationPreset,
  type AnimationTrigger,
  type ElementAnimation,
} from "@/lib/editor/animation"
import { slideTimeline } from "@/lib/editor/slide-timeline"
import type { ElementTransformProps } from "@/lib/editor/types"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { useEditorLayout } from "@/components/editor/editor-layout"
import {
  NumberSetting,
  SettingsRow,
  SettingsSection,
} from "@/components/editor/settings/fields"

/** Time to let the last animation settle before the preview ends. */
const PREVIEW_TAIL_MS = 400

function AnimationSettings({
  props,
  update,
}: {
  props: Partial<ElementTransformProps>
  update: (patch: Partial<ElementTransformProps>) => void
}) {
  const { name, strokeWidth } = useNode((node) => ({
    name: node.data.name,
    strokeWidth: node.data.props.strokeWidth as number | undefined,
  }))
  const { query } = useEditor()
  const { playAnimationPreview } = useEditorLayout()
  const presetId = React.useId()
  const startsId = React.useId()
  const easingId = React.useId()

  const animation: ElementAnimation = {
    ...DEFAULT_ANIMATION,
    ...props.animation,
  }
  const change = (patch: Partial<ElementAnimation>) =>
    update({ animation: { ...animation, ...patch } })

  const available = presetsFor(name)
  const active = animation.preset !== "none"
  const stepped = animation.preset === "typewriter"

  const play = () => {
    const { totalMs } = slideTimeline(query.getNodes())
    playAnimationPreview(totalMs + PREVIEW_TAIL_MS)
  }

  return (
    <SettingsSection title="Animation">
      <Field>
        <FieldLabel htmlFor={presetId}>Preset</FieldLabel>
        <NativeSelect
          id={presetId}
          className="w-full"
          value={animation.preset}
          onChange={(event) =>
            change({ preset: event.target.value as AnimationPreset })
          }
        >
          <NativeSelectOption value="none">None</NativeSelectOption>
          {(["entrance", "emphasis"] as const).map((group) => (
            <NativeSelectOptGroup
              key={group}
              label={group === "entrance" ? "Entrance" : "Emphasis"}
            >
              {available
                .filter((preset) => preset.group === group)
                .map((preset) => (
                  <NativeSelectOption key={preset.id} value={preset.id}>
                    {preset.label}
                  </NativeSelectOption>
                ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
      </Field>

      {active ? (
        <>
          <Field>
            <FieldLabel htmlFor={startsId}>Starts</FieldLabel>
            <NativeSelect
              id={startsId}
              className="w-full"
              value={animation.trigger}
              onChange={(event) =>
                change({ trigger: event.target.value as AnimationTrigger })
              }
            >
              {(Object.keys(TRIGGERS) as AnimationTrigger[]).map((trigger) => (
                <NativeSelectOption key={trigger} value={trigger}>
                  {TRIGGERS[trigger]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <SettingsRow>
            <NumberSetting
              label="Duration (ms)"
              value={animation.duration}
              min={100}
              max={10000}
              step={100}
              onChange={(duration) => change({ duration })}
            />
            <NumberSetting
              label="Delay (ms)"
              value={animation.delay}
              min={0}
              max={20000}
              step={100}
              onChange={(delay) => change({ delay })}
            />
          </SettingsRow>
          {stepped ? null : (
            <Field>
              <FieldLabel htmlFor={easingId}>Easing</FieldLabel>
              <NativeSelect
                id={easingId}
                className="w-full"
                value={animation.easing}
                onChange={(event) =>
                  change({ easing: event.target.value as AnimationEasing })
                }
              >
                {(Object.keys(EASINGS) as AnimationEasing[]).map((easing) => (
                  <NativeSelectOption key={easing} value={easing}>
                    {EASINGS[easing].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}
          {isEmphasis(animation.preset) ? (
            <Field>
              <NumberSetting
                label="Repeats"
                value={animation.repeat}
                min={0}
                max={20}
                onChange={(repeat) => change({ repeat })}
              />
              <FieldDescription>0 repeats forever.</FieldDescription>
            </Field>
          ) : null}
          {animation.preset === "draw" && name === "Shape" && !strokeWidth ? (
            <FieldDescription>
              Draw on animates the outline. Give this shape a stroke to see it.
            </FieldDescription>
          ) : null}
          <FieldDescription>
            Elements animate in layer order, bottom to top.
          </FieldDescription>
          <Button variant="outline" size="sm" onClick={play}>
            <PlayIcon data-icon="inline-start" />
            Play slide animations
          </Button>
        </>
      ) : null}
    </SettingsSection>
  )
}

export { AnimationSettings }
