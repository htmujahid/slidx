"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"

import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { ElementBox } from "@/components/editor/nodes/element-box"
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

  return (
    <ElementBox {...transform}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          isolation: isolate ? "isolate" : undefined,
        }}
      >
        {children}
      </div>
    </ElementBox>
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
