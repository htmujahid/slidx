import type { UserComponent } from "@craftjs/core"

import { FieldGroup } from "@/components/ui/field"
import { PropFields } from "../prop-fields"
import { timing, timingDefaults, type TimingProps } from "./timing"
import { TimingFields } from "./timing-fields"
import { useConnectRef } from "./use-connect-ref"

type AnimateMotionProps = TimingProps & {
  path: string
  rotate: string
  mpath: string
}

export const SvgAnimateMotion: UserComponent<Partial<AnimateMotionProps>> = (
  props
) => {
  const p = props as AnimateMotionProps
  return (
    <animateMotion
      ref={useConnectRef()}
      path={p.mpath ? undefined : p.path}
      rotate={p.rotate}
      {...timing(p)}
    >
      {p.mpath ? <mpath href={p.mpath} /> : null}
    </animateMotion>
  )
}

SvgAnimateMotion.craft = {
  displayName: "animateMotion",
  props: {
    path: "M 0 0 q 40 -40 80 0 q 40 40 80 0",
    rotate: "0",
    mpath: "",
    ...timingDefaults,
  } satisfies AnimateMotionProps,
  rules: { canMoveIn: () => false },
  related: {
    settings: () => (
      <FieldGroup>
        <PropFields
          fields={[
            { type: "text", key: "path", label: "Motion path", mono: true },
            { type: "text", key: "mpath", label: "Follow path (#el-…)", mono: true },
            { type: "text", key: "rotate", label: "Rotate (auto | angle)", mono: true },
          ]}
        />
        <TimingFields />
      </FieldGroup>
    ),
  },
}
