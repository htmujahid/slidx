import type { UserComponent } from "@craftjs/core"

import { FieldGroup } from "@/components/ui/field"
import { PropFields } from "../prop-fields"
import { timing, timingDefaults, type TimingProps } from "./timing"
import { TimingFields } from "./timing-fields"
import { useConnectRef } from "./use-connect-ref"

type AnimateTransformProps = TimingProps & {
  type: "translate" | "scale" | "rotate" | "skewX" | "skewY"
  from: string
  to: string
  values: string
}

export const SvgAnimateTransform: UserComponent<
  Partial<AnimateTransformProps>
> = (props) => {
  const p = props as AnimateTransformProps
  return (
    <animateTransform
      ref={useConnectRef()}
      attributeName="transform"
      type={p.type}
      from={p.from || undefined}
      to={p.to || undefined}
      values={p.values || undefined}
      additive="sum"
      {...timing(p)}
    />
  )
}

SvgAnimateTransform.craft = {
  displayName: "animateTransform",
  props: {
    type: "scale",
    from: "1",
    to: "1.5",
    values: "",
    ...timingDefaults,
  } satisfies AnimateTransformProps,
  rules: { canMoveIn: () => false },
  related: {
    settings: () => (
      <FieldGroup>
        <PropFields
          fields={[
            {
              type: "select",
              key: "type",
              label: "Transform",
              options: ["translate", "scale", "rotate", "skewX", "skewY"],
            },
            { type: "text", key: "from", label: "From", mono: true },
            { type: "text", key: "to", label: "To", mono: true },
            { type: "text", key: "values", label: "Values (optional)", mono: true },
          ]}
        />
        <TimingFields />
      </FieldGroup>
    ),
  },
}
