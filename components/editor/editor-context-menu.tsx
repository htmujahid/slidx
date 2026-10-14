"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  AlignCenterHorizontalIcon,
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  CopyIcon,
  GroupIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Redo2Icon,
  Trash2Icon,
  Undo2Icon,
  UngroupIcon,
} from "lucide-react"

import type { Alignment } from "@/lib/editor/align"
import type { Point } from "@/lib/editor/geometry"
import { canEditContent, getElementLabel } from "@/lib/editor/labels"
import { LIBRARY } from "@/lib/editor/library/items"
import { useEditorActions } from "@/hooks/use-editor-actions"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useChrome, useDeck } from "@/components/editor/editor-stores"

const ALIGNMENTS: Array<[Alignment, string]> = [
  ["left", "Left"],
  ["center", "Center horizontally"],
  ["right", "Right"],
  ["top", "Top"],
  ["middle", "Center vertically"],
  ["bottom", "Bottom"],
]

function EditorContextMenu({ children }: { children: React.ReactNode }) {
  const setEditingId = useChrome((state) => state.setEditingId)
  const addSlide = useDeck((state) => state.addSlide)
  const { duplicate, remove, align, reorder, addLibraryItem, group, ungroup } =
    useEditorActions()
  const insertAt = React.useRef<Point | undefined>(undefined)
  const editingFromMenu = React.useRef(false)
  const { actions, query, selection, selectedCount, canUndo, canRedo } =
    useEditor((state, query) => {
      const selected = [...state.events.selected].filter(
        (nodeId) => nodeId !== ROOT_NODE && state.nodes[nodeId]
      )
      const [id] = selected
      const node = id ? state.nodes[id] : undefined
      const siblings = state.nodes[ROOT_NODE]?.data.nodes ?? []
      return {
        selection: node
          ? {
              id,
              name: node.data.name,
              props: node.data.props,
              first: siblings[0] === id,
              last: siblings.at(-1) === id,
            }
          : null,
        selectedCount: selected.length,
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo(),
      }
    })

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) editingFromMenu.current = false
      }}
    >
      <ContextMenuTrigger
        render={
          <div
            className="flex min-h-0 flex-1"
            tabIndex={0}
            aria-label="Slide canvas. Right-click for editing actions."
          />
        }
        onContextMenuCapture={(event) => {
          const target = event.target
          if (!(target instanceof Element)) return
          if (
            target.closest("input, textarea, select, [contenteditable=true]")
          ) {
            event.stopPropagation()
            return
          }
          const id = target
            .closest("[data-editor-node]")
            ?.getAttribute("data-editor-node")
          if (id) {
            const selected = query.getEvent("selected").all()
            if (!selected.includes(id)) actions.selectNode(id)
          } else if (event.button !== 0) actions.clearEvents()
          const surface = event.currentTarget.querySelector<HTMLElement>(
            "[data-slide-canvas]"
          )
          const rect = surface?.getBoundingClientRect()
          const SLIDE_WIDTH = surface?.offsetWidth ?? 0
          const SLIDE_HEIGHT = surface?.offsetHeight ?? 0
          insertAt.current =
            rect && rect.width && rect.height && event.button !== 0
              ? {
                  x: Math.max(
                    0,
                    Math.min(
                      SLIDE_WIDTH,
                      ((event.clientX - rect.left) / rect.width) * SLIDE_WIDTH
                    )
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      SLIDE_HEIGHT,
                      ((event.clientY - rect.top) / rect.height) * SLIDE_HEIGHT
                    )
                  ),
                }
              : undefined
        }}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-56"
        finalFocus={() => (editingFromMenu.current ? false : true)}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <ContextMenuGroup>
          <ContextMenuLabel className="truncate">
            {selectedCount > 1
              ? `${selectedCount} elements`
              : selection
                ? getElementLabel(selection)
                : "Slide"}
          </ContextMenuLabel>
          {!selection && (
            <>
              <ContextMenuItem
                disabled={!canUndo}
                onClick={() => actions.history.undo()}
              >
                <Undo2Icon />
                Undo
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!canRedo}
                onClick={() => actions.history.redo()}
              >
                <Redo2Icon />
                Redo
              </ContextMenuItem>
            </>
          )}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        {selectedCount > 1 ? (
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => group()}>
              <GroupIcon />
              Group selection<ContextMenuShortcut>⌘G</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => duplicate()}>
              <CopyIcon />
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onClick={() => remove()}>
              <Trash2Icon />
              Delete<ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
        ) : selection ? (
          <>
            <ContextMenuGroup>
              {canEditContent(selection) && (
                <ContextMenuItem
                  onClick={() => {
                    editingFromMenu.current = true
                    setEditingId(selection.id)
                  }}
                >
                  <PencilIcon />
                  Edit content<ContextMenuShortcut>Enter</ContextMenuShortcut>
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => duplicate(selection.id)}>
                <CopyIcon />
                Duplicate
              </ContextMenuItem>
              {selection.name === "Group" && (
                <ContextMenuItem onClick={() => ungroup(selection.id)}>
                  <UngroupIcon />
                  Ungroup<ContextMenuShortcut>⇧⌘G</ContextMenuShortcut>
                </ContextMenuItem>
              )}
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <AlignCenterHorizontalIcon />
                  Align to slide
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <ContextMenuGroup>
                    {ALIGNMENTS.map(([value, label]) => (
                      <ContextMenuItem
                        key={value}
                        onClick={() => align(value, selection.id)}
                      >
                        {label}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <LayersIcon />
                  Arrange
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <ContextMenuGroup>
                    <ContextMenuItem
                      disabled={selection.last}
                      onClick={() => reorder("forward", selection.id)}
                    >
                      <ArrowUpToLineIcon />
                      Bring forward
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={selection.first}
                      onClick={() => reorder("backward", selection.id)}
                    >
                      <ArrowDownToLineIcon />
                      Send backward
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                variant="destructive"
                onClick={() => remove(selection.id)}
              >
                <Trash2Icon />
                Delete<ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        ) : (
          <ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <PlusIcon />
                Insert element
              </ContextMenuSubTrigger>
              <ContextMenuSubContent
                onKeyDown={(event) => event.stopPropagation()}
              >
                <ContextMenuGroup>
                  {LIBRARY.filter(
                    (item) =>
                      (item.group !== "shape" ||
                        item.id === "shape:rectangle" ||
                        item.id === "shape:ellipse") &&
                      (item.group !== "chart" || item.id === "chart:bar") &&
                      (item.group !== "text" ||
                        item.id === "text:heading" ||
                        item.id === "text:text" ||
                        item.id === "text:bullet-list")
                  ).map((item) => (
                    <ContextMenuItem
                      key={item.id}
                      onClick={() => addLibraryItem(item.id, insertAt.current)}
                    >
                      <item.icon />
                      {item.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onClick={addSlide}>
              <PlusIcon />
              Add slide
            </ContextMenuItem>
          </ContextMenuGroup>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export { EditorContextMenu }
