"use client"

import type { UserComponent } from "@craftjs/core"

import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { ElementBox } from "@/components/editor/nodes/element-box"
import { EmojiSettings } from "@/components/editor/settings/emoji-settings"

export type EmojiBoxProps = ElementTransformProps & {
  emoji: string
}

const EmojiBox: UserComponent<Partial<EmojiBoxProps>> = (props) => {
  const { emoji, ...transform } = {
    ...EmojiBox.craft!.props,
    ...props,
  } as EmojiBoxProps
  const { width, height } = transform

  return (
    <ElementBox {...transform}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.min(width, height) * 0.8,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {emoji}
      </div>
    </ElementBox>
  )
}

EmojiBox.craft = {
  displayName: "Emoji",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 160,
    height: 160,
    emoji: "🚀",
  } satisfies EmojiBoxProps,
  custom: { handles: "all" },
  related: { settings: EmojiSettings },
}

export { EmojiBox }
