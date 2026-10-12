"use client"

import type { UserComponent } from "@craftjs/core"

import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
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
    <SvgElement {...transform}>
      <rect width={width} height={height} fill="transparent" />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.min(width, height) * 0.8}
        className="select-none"
      >
        {emoji}
      </text>
    </SvgElement>
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
