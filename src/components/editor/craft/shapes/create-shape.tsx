import { createElement, type ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import type { TrackKind } from "../../kind-icons"
import { isAnimationType } from "../animation-registry"
import type { FieldDef } from "../field-def"
import { PropFields } from "../prop-fields"
import { useShapeMove } from "../use-shape-move"

export type ShapeProps = Record<string, unknown> & { children?: ReactNode }

export type ShapeIcon = React.ComponentType<{ className?: string }>

export type ShapeComponent = UserComponent<ShapeProps> & {
  shapeMeta: {
    tag: string
    kind: TrackKind
    icon: ShapeIcon
    move: (props: ShapeProps, dx: number, dy: number) => void
    placeAt: (props: ShapeProps, x: number, y: number) => void
  }
}

export type ShapeConfig = {
  tag: string
  kind: TrackKind
  icon: ShapeIcon
  defaults: Record<string, unknown>
  move: (props: ShapeProps, dx: number, dy: number) => void
  placeAt: (props: ShapeProps, x: number, y: number) => void
  fields: FieldDef[]
  renderTag?: string
  attrs?: (props: ShapeProps) => Record<string, unknown>
  content?: (props: ShapeProps) => ReactNode
  canMoveIn?: (incoming: Node[]) => boolean
}

export function createShape(config: ShapeConfig): ShapeComponent {
  const Shape: UserComponent<ShapeProps> = ({ children, ...props }) => {
    const {
      id,
      connectors: { connect },
    } = useNode()
    const onPointerDown = useShapeMove(config.move)

    const attrs = config.attrs ? config.attrs(props) : props
    return createElement(
      config.renderTag ?? config.tag,
      {
        ...attrs,
        id: `el-${id}`,
        ref: (dom: SVGElement | null) => {
          if (dom) connect(dom as unknown as HTMLElement)
        },
        onPointerDown,
        style: { cursor: "move" },
      },
      config.content?.(props),
      children
    )
  }

  const Settings = () => <PropFields fields={config.fields} />

  Shape.craft = {
    displayName: config.tag,
    props: config.defaults,
    rules: {
      canMoveIn: (incoming: Node[]) =>
        config.canMoveIn
          ? config.canMoveIn(incoming)
          : incoming.every((node) => isAnimationType(node.data.type)),
    },
    related: { settings: Settings },
  }

  const shapeComponent = Shape as ShapeComponent
  shapeComponent.shapeMeta = {
    tag: config.tag,
    kind: config.kind,
    icon: config.icon,
    move: config.move,
    placeAt: config.placeAt,
  }
  return shapeComponent
}

export function isShapeType(type: unknown): type is ShapeComponent {
  return typeof type === "function" && "shapeMeta" in type
}

export function getShapeMeta(type: unknown) {
  return isShapeType(type) ? type.shapeMeta : undefined
}
