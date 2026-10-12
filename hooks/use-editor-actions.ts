"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"

import { alignToSlide, type Alignment } from "@/lib/editor/align"
import {
  readElements,
  writeElements,
  type CopiedElement,
} from "@/lib/editor/clipboard"
import { DUPLICATE_OFFSET } from "@/lib/editor/constants"
import type { Point } from "@/lib/editor/geometry"
import { getLibraryItem } from "@/lib/editor/library"

function useEditorActions() {
  const { actions, query } = useEditor()

  const addLibraryItem = React.useCallback(
    (itemId: string, at?: Point) => {
      const item = getLibraryItem(itemId)
      if (!item) return
      const tree = query.parseReactElement(item.create(at)).toNodeTree()
      actions.addNodeTree(tree, ROOT_NODE)
      actions.selectNode(tree.rootNodeId)
    },
    [actions, query]
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

  const insertElements = React.useCallback(
    (elements: CopiedElement[]) => {
      const ids = elements.map(({ type, props }) => {
        const element = React.createElement(type as React.ElementType, props)
        const tree = query.parseReactElement(element).toNodeTree()
        actions.addNodeTree(tree, ROOT_NODE)
        return tree.rootNodeId
      })
      if (ids.length > 0) actions.selectNode(ids)
    },
    [actions, query]
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
          const { data } = query.node(targetId).get()
          const props = data.props as { x: number; y: number }
          return {
            type: data.type as React.ElementType,
            props: {
              ...props,
              x: props.x + DUPLICATE_OFFSET,
              y: props.y + DUPLICATE_OFFSET,
            },
          }
        })
      )
    },
    [query, insertElements, getTargets, getSelectedId]
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
        getTargets(id).map((targetId) => {
          const { data } = query.node(targetId).get()
          return {
            type: data.type as React.ElementType,
            props: data.props,
          }
        })
      ),
    [query, getTargets]
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

  const align = React.useCallback(
    (alignment: Alignment, id?: string) => {
      getTargets(id).forEach((targetId) => {
        actions.setProp(targetId, (props) => {
          Object.assign(props, alignToSlide(props as never, alignment))
        })
      })
    },
    [actions, getTargets]
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
    getSelectedId,
    getSelectedIds,
  }
}

export { useEditorActions }
