import { createElement, type ReactNode } from "react"
import type { Node, UserComponent } from "@craftjs/core"

import type { FieldDef } from "../field-def"
import { PropFields } from "../prop-fields"

export type FilterPrimitiveComponent = UserComponent<
  Record<string, unknown>
> & {
  primitiveMeta: {
    tag: string
    description: string
    container: boolean
    parentTags?: string[]
  }
}

type PrimitiveConfig = {
  tag: string
  description: string
  defaults: Record<string, unknown>
  fields: FieldDef[]
  childTags?: string[]
  parentTags?: string[]
}

export function createFilterPrimitive(
  config: PrimitiveConfig
): FilterPrimitiveComponent {
  const Primitive: UserComponent<Record<string, unknown>> = ({
    children,
    ...props
  }) => {
    const attrs = Object.fromEntries(
      Object.entries(props).filter(
        ([, value]) => value !== "" && value !== undefined
      )
    )
    return createElement(config.tag, attrs, children as ReactNode)
  }

  const Settings = () => <PropFields fields={config.fields} />

  Primitive.craft = {
    displayName: config.tag,
    props: config.defaults,
    rules: {
      canMoveIn: (incoming: Node[]) =>
        !!config.childTags &&
        incoming.every(
          (node) =>
            isFilterPrimitiveType(node.data.type) &&
            config.childTags!.includes(node.data.type.primitiveMeta.tag)
        ),
      canDrag: () => false,
    },
    related: { settings: Settings },
  }

  const primitive = Primitive as FilterPrimitiveComponent
  primitive.primitiveMeta = {
    tag: config.tag,
    description: config.description,
    container: !!config.childTags,
    parentTags: config.parentTags,
  }
  return primitive
}

export function isFilterPrimitiveType(
  type: unknown
): type is FilterPrimitiveComponent {
  return typeof type === "function" && "primitiveMeta" in type
}
