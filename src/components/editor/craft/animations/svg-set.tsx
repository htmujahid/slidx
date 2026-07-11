import type { UserComponent } from "@craftjs/core"

import { FieldGroup } from "@/components/ui/field"
import { PropFields } from "../prop-fields"
import { timing, timingDefaults, type TimingProps } from "./timing"
import { TimingFields } from "./timing-fields"
import { useConnectRef } from "./use-connect-ref"

type SetProps = TimingProps & {
  attributeName: string
  to: string
}

export const SvgSet: UserComponent<Partial<SetProps>> = (props) => {
  const p = props as SetProps
  return (
    <set
      ref={useConnectRef()}
      attributeName={p.attributeName}
      to={p.to}
      {...timing(p)}
    />
  )
}

SvgSet.craft = {
  displayName: "set",
  props: {
    attributeName: "fill",
    to: "#8B5CF6",
    ...timingDefaults,
    dur: 1,
  } satisfies SetProps,
  rules: { canMoveIn: () => false },
  related: {
    settings: () => (
      <FieldGroup>
        <PropFields
          fields={[
            { type: "text", key: "attributeName", label: "Attribute", mono: true },
            { type: "text", key: "to", label: "Value", mono: true },
          ]}
        />
        <TimingFields />
      </FieldGroup>
    ),
  },
}
