"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"

import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { GroupSettings } from "@/components/editor/settings/group-settings"

export type GroupProps = ElementTransformProps & {
  isolate: boolean
}

const Group: UserComponent<
  Partial<GroupProps> & { children?: React.ReactNode }
> = ({ children, ...props }) => {
  const { isolate, ...transform } = {
    ...Group.craft!.props,
    ...props,
  } as GroupProps
  const { width, height } = transform

  return (
    <SvgElement {...transform}>
      <rect width={width} height={height} fill="transparent" />
      <g style={isolate ? { isolation: "isolate" } : undefined}>{children}</g>
    </SvgElement>
  )
}

Group.craft = {
  displayName: "Group",
  props: {
    ...DEFAULT_TRANSFORM,
    isolate: true,
  } satisfies GroupProps,
  custom: { handles: "none" },
  related: { settings: GroupSettings },
}

export { Group }
