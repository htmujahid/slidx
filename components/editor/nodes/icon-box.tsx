"use client"

import type { UserComponent } from "@craftjs/core"

import { DEFAULT_ICON, ICONS, type IconName } from "@/lib/editor/icons"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { IconSettings } from "@/components/editor/settings/icon-settings"

export type IconBoxProps = ElementTransformProps & {
  icon: IconName
  color: string
  strokeWidth: number
}

const IconBox: UserComponent<Partial<IconBoxProps>> = (props) => {
  const { icon, color, strokeWidth, ...transform } = {
    ...IconBox.craft!.props,
    ...props,
  } as IconBoxProps
  const { width, height } = transform
  const Icon = ICONS[icon] ?? ICONS[DEFAULT_ICON]

  return (
    <SvgElement {...transform}>
      <rect width={width} height={height} fill="transparent" />
      <Icon
        width={width}
        height={height}
        color={color}
        strokeWidth={strokeWidth}
      />
    </SvgElement>
  )
}

IconBox.craft = {
  displayName: "Icon",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 160,
    height: 160,
    icon: DEFAULT_ICON,
    color: "#0a0a0a",
    strokeWidth: 2,
  } satisfies IconBoxProps,
  custom: { handles: "all" },
  related: { settings: IconSettings },
}

export { IconBox }
