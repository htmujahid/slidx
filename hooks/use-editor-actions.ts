"use client"

import * as React from "react"
import { Element as CraftElement, ROOT_NODE, useEditor } from "@craftjs/core"

import { alignToSlide, type Alignment } from "@/lib/editor/align"
import {
  readElements,
  writeElements,
  type CopiedElement,
} from "@/lib/editor/clipboard"
import { DUPLICATE_OFFSET } from "@/lib/editor/constants"
import {
  elementBounds,
  normalizeAngle,
  rotatePoint,
  roundTo,
  type Point,
} from "@/lib/editor/geometry"
import { getLibraryItem } from "@/lib/editor/library"
import { slideSizeOf } from "@/lib/editor/slide-size"
import type { ElementTransformProps } from "@/lib/editor/types"
import { Group } from "@/components/editor/nodes/group"

function useEditorActions() {
  const { actions, query } = useEditor()

  const getSlideSize = React.useCallback(
    () => slideSizeOf(query.node(ROOT_NODE).get().data.props),
    [query]
  )

  const addLibraryItem = React.useCallback(
    (itemId: string, at?: Point) => {
      const item = getLibraryItem(itemId)
      if (!item) return
      const { width, height } = getSlideSize()
      const tree = query
        .parseReactElement(item.create(at ?? { x: width / 2, y: height / 2 }))
        .toNodeTree()
      actions.addNodeTree(tree, ROOT_NODE)
      actions.selectNode(tree.rootNodeId)
    },
    [actions, query, getSlideSize]
  )

  const getSelectedIds = React.useCallback(
    () =>
      query
        .getEvent("selected")
        .all()
        .filter((id) => id !== ROOT_NODE),
    [query]
  )

  const getSelectedId = React.useCallback(
    () => getSelectedIds()[0] as string | undefined,
    [getSelectedIds]
  )

  const toReactElement = React.useCallback(
    (copied: CopiedElement): React.ReactElement => {
      if (copied.canvas || copied.children?.length) {
        return React.createElement(
          CraftElement,
          { is: copied.type, canvas: true, ...copied.props },
          ...(copied.children ?? []).map(toReactElement)
        )
      }
      return React.createElement(copied.type, copied.props)
    },
    []
  )

  const toCopiedElement = React.useCallback(
    (id: string): CopiedElement => {
      const { data } = query.node(id).get()
      return {
        type: data.type as React.ElementType,
        props: data.props,
        canvas: Boolean(data.isCanvas),
        children: data.nodes.map((childId) => toCopiedElement(childId)),
      }
    },
    [query]
  )

  const insertElements = React.useCallback(
    (elements: CopiedElement[]) => {
      const ids = elements.map((copied) => {
        const tree = query
          .parseReactElement(toReactElement(copied))
          .toNodeTree()
        actions.addNodeTree(tree, ROOT_NODE)
        return tree.rootNodeId
      })
      if (ids.length > 0) actions.selectNode(ids)
    },
    [actions, query, toReactElement]
  )

  const getTargets = React.useCallback(
    (id?: string) => (id ? [id] : getSelectedIds()),
    [getSelectedIds]
  )

  const duplicate = React.useCallback(
    (id = getSelectedId()) => {
      const targets = getTargets(id)
      insertElements(
        targets.map((targetId) => {
          const copied = toCopiedElement(targetId)
          const props = copied.props as { x: number; y: number }
          return {
            ...copied,
            props: {
              ...copied.props,
              x: props.x + DUPLICATE_OFFSET,
              y: props.y + DUPLICATE_OFFSET,
            },
          }
        })
      )
    },
    [insertElements, getTargets, getSelectedId, toCopiedElement]
  )

  const remove = React.useCallback(
    (id?: string) => {
      const targets = getTargets(id)
      if (targets.length === 0) return
      actions.clearEvents()
      targets.forEach((targetId) => actions.delete(targetId))
    },
    [actions, getTargets]
  )

  const copy = React.useCallback(
    (id?: string) =>
      writeElements(
        getTargets(id).map((targetId) => toCopiedElement(targetId))
      ),
    [getTargets, toCopiedElement]
  )

  const cut = React.useCallback(
    (id?: string) => {
      if (copy(id)) remove(id)
    },
    [copy, remove]
  )

  const paste = React.useCallback(() => {
    const clipboard = readElements()
    if (!clipboard) return
    insertElements(
      clipboard.elements.map(({ type, props }) => ({
        type,
        props: {
          ...props,
          x: (props.x as number) + clipboard.offset,
          y: (props.y as number) + clipboard.offset,
        },
      }))
    )
  }, [insertElements])

  const selectAll = React.useCallback(() => {
    const ids = query
      .node(ROOT_NODE)
      .get()
      .data.nodes.filter((id) => {
        const { data } = query.node(id).get()
        return !data.hidden && !data.custom.locked
      })
    if (ids.length > 0) actions.selectNode(ids)
  }, [actions, query])

  const reorder = React.useCallback(
    (
      direction: "forward" | "backward" | "front" | "back",
      id = getSelectedId()
    ) => {
      if (!id) return
      const siblings = query.node(ROOT_NODE).get().data.nodes
      const index = siblings.indexOf(id)
      const last = siblings.length - 1
      if (direction === "forward" && index < last) {
        actions.move(id, ROOT_NODE, index + 2)
      } else if (direction === "backward" && index > 0) {
        actions.move(id, ROOT_NODE, index - 1)
      } else if (direction === "front" && index < last) {
        actions.move(id, ROOT_NODE, siblings.length)
      } else if (direction === "back" && index > 0) {
        actions.move(id, ROOT_NODE, 0)
      }
    },
    [actions, query, getSelectedId]
  )

  const nudge = React.useCallback(
    (dx: number, dy: number, id?: string) => {
      getTargets(id).forEach((targetId) => {
        if (query.node(targetId).get().data.custom.locked) return
        actions.history.throttle(400).setProp(targetId, (props) => {
          props.x += dx
          props.y += dy
        })
      })
    },
    [actions, query, getTargets]
  )

  const group = React.useCallback(() => {
    const ids = getSelectedIds()
    const rootNodes = query.node(ROOT_NODE).get().data.nodes
    const ordered = rootNodes.filter((nodeId) => ids.includes(nodeId))
    if (ordered.length < 2) return

    const bounds = ordered.map((nodeId) =>
      elementBounds(
        query.node(nodeId).get().data.props as ElementTransformProps
      )
    )
    const left = Math.min(...bounds.map((b) => b.left))
    const top = Math.min(...bounds.map((b) => b.top))
    const right = Math.max(...bounds.map((b) => b.right))
    const bottom = Math.max(...bounds.map((b) => b.bottom))

    const tree = query
      .parseReactElement(
        React.createElement(CraftElement, {
          is: Group,
          canvas: true,
          x: roundTo(left, 3),
          y: roundTo(top, 3),
          width: roundTo(right - left, 3),
          height: roundTo(bottom - top, 3),
        })
      )
      .toNodeTree()
    actions.addNodeTree(tree, ROOT_NODE)
    const groupId = tree.rootNodeId

    ordered.forEach((nodeId, index) => {
      actions.move(nodeId, groupId, index)
      actions.setProp(nodeId, (props) => {
        props.x = roundTo(props.x - left, 3)
        props.y = roundTo(props.y - top, 3)
      })
    })
    actions.selectNode(groupId)
  }, [actions, query, getSelectedIds])

  const ungroup = React.useCallback(
    (id = getSelectedId()) => {
      if (!id) return
      const node = query.node(id).get()
      if (node.data.name !== "Group") return
      const groupProps = node.data.props as ElementTransformProps
      const center = {
        x: groupProps.x + groupProps.width / 2,
        y: groupProps.y + groupProps.height / 2,
      }
      const flipRotation = groupProps.flipX !== groupProps.flipY
      const children = [...node.data.nodes]
      const base = query.node(ROOT_NODE).get().data.nodes.length

      children.forEach((childId, index) => {
        const child = query.node(childId).get().data
          .props as ElementTransformProps
        const relative = {
          x: child.x + child.width / 2 - groupProps.width / 2,
          y: child.y + child.height / 2 - groupProps.height / 2,
        }
        const flipped = {
          x: groupProps.flipX ? -relative.x : relative.x,
          y: groupProps.flipY ? -relative.y : relative.y,
        }
        const rotated = rotatePoint(flipped, groupProps.rotation)
        actions.move(childId, ROOT_NODE, base + index)
        actions.setProp(childId, (props) => {
          props.x = roundTo(center.x + rotated.x - child.width / 2, 3)
          props.y = roundTo(center.y + rotated.y - child.height / 2, 3)
          props.rotation = roundTo(
            normalizeAngle(
              (flipRotation ? -child.rotation : child.rotation) +
                groupProps.rotation
            )
          )
          if (groupProps.flipX) props.flipX = !child.flipX
          if (groupProps.flipY) props.flipY = !child.flipY
        })
      })
      actions.delete(id)
      actions.selectNode(children)
    },
    [actions, query, getSelectedId]
  )

  const toggleLock = React.useCallback(
    (id?: string) => {
      const targets = getTargets(id)
      const lock = !targets.every(
        (targetId) => query.node(targetId).get().data.custom.locked
      )
      targets.forEach((targetId) =>
        actions.setCustom(targetId, (custom) => {
          custom.locked = lock
        })
      )
    },
    [actions, query, getTargets]
  )

  const toggleHidden = React.useCallback(
    (id?: string) => {
      const targets = getTargets(id)
      const hide = !targets.every(
        (targetId) => query.node(targetId).get().data.hidden
      )
      targets.forEach((targetId) => actions.setHidden(targetId, hide))
    },
    [actions, query, getTargets]
  )

  const align = React.useCallback(
    (alignment: Alignment, id?: string) => {
      getTargets(id).forEach((targetId) => {
        actions.setProp(targetId, (props) => {
          Object.assign(
            props,
            alignToSlide(props as never, alignment, getSlideSize())
          )
        })
      })
    },
    [actions, getTargets, getSlideSize]
  )

  return {
    addLibraryItem,
    duplicate,
    remove,
    copy,
    cut,
    paste,
    selectAll,
    reorder,
    nudge,
    align,
    group,
    ungroup,
    toggleLock,
    toggleHidden,
    getSelectedId,
    getSelectedIds,
  }
}

export { useEditorActions }
