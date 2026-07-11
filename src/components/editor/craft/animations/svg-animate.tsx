import type { UserComponent } from "@craftjs/core"

import { FieldGroup } from "@/components/ui/field"
import { PropFields } from "../prop-fields"
import { timing, timingDefaults, type TimingProps } from "./timing"
import { TimingFields } from "./timing-fields"
import { useConnectRef } from "./use-connect-ref"

type AnimateProps = TimingProps & {
  attributeName: string
  from: string
  to: string
  values: string
}

export const SvgAnimate: UserComponent<Partial<AnimateProps>> = (props) => {
  const p = props as AnimateProps
  return (
    <animate
      ref={useConnectRef()}
      attributeName={p.attributeName}
      from={p.from || undefined}
      to={p.to || undefined}
      values={p.values || undefined}
      {...timing(p)}
    />
  )
}

SvgAnimate.craft = {
  displayName: "animate",
  props: {
    attributeName: "opacity",
    from: "0",
    to: "1",
    values: "",
    ...timingDefaults,
  } satisfies AnimateProps,
  rules: { canMoveIn: () => false },
  related: {
    settings: () => (
      <FieldGroup>
        <PropFields
          fields={[
            { type: "text", key: "attributeName", label: "Attribute", mono: true },
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
