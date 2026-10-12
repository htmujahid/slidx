"use client"

import { ChevronDownIcon } from "lucide-react"

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerTrigger,
  EmojiPickerValue,
} from "@/components/reui/emoji-picker"
import type { EmojiBoxProps } from "@/components/editor/nodes/emoji-box"
import { AnimationSettings } from "@/components/editor/settings/animation-settings"
import { EffectsSettings } from "@/components/editor/settings/effects-settings"
import { SettingsSection } from "@/components/editor/settings/fields"
import { TransformSettings } from "@/components/editor/settings/transform-settings"
import { useNodeProps } from "@/components/editor/settings/use-node-props"

function EmojiSettings() {
  const { props, update } = useNodeProps<EmojiBoxProps>()

  return (
    <>
      <SettingsSection title="Emoji">
        <EmojiPicker
          value={props.emoji}
          onValueChange={(emoji) => {
            if (emoji) update({ emoji })
          }}
          aria-label="Emoji"
        >
          <EmojiPickerTrigger
            size="sm"
            className="w-full justify-start font-normal"
          >
            <EmojiPickerValue />
            <span className="min-w-0 flex-1 truncate text-left">
              Change emoji
            </span>
            <ChevronDownIcon data-icon="inline-end" />
          </EmojiPickerTrigger>
          <EmojiPickerContent />
        </EmojiPicker>
      </SettingsSection>
      <TransformSettings props={props} update={update} />
      <EffectsSettings props={props} update={update} />
      <AnimationSettings props={props} update={update} />
    </>
  )
}

export { EmojiSettings }
