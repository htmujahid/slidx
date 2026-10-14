"use client"

import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  ClipboardIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  GroupIcon,
  LockIcon,
  LockOpenIcon,
  Redo2Icon,
  ScissorsIcon,
  SquareDashedIcon,
  Trash2Icon,
  Undo2Icon,
  UngroupIcon,
} from "lucide-react"

import type { Alignment } from "@/lib/editor/align"
import { useEditorActions } from "@/hooks/use-editor-actions"
import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Shortcut } from "@/components/editor/menubar/shortcut"

const ALIGNMENTS: Array<[Alignment, string]> = [
  ["left", "Left"],
  ["center", "Center horizontally"],
  ["right", "Right"],
  ["top", "Top"],
  ["middle", "Center vertically"],
  ["bottom", "Bottom"],
]

function EditMenu() {
  const {
    duplicate,
    remove,
    copy,
    cut,
    paste,
    selectAll,
    reorder,
    align,
    group,
    ungroup,
    toggleLock,
    toggleHidden,
  } = useEditorActions()
  const {
    actions,
    canUndo,
    canRedo,
    selectedCount,
    canUngroup,
    locked,
    hidden,
  } = useEditor((state, query) => {
    const ids = [...state.events.selected].filter((id) => id !== ROOT_NODE)
    const nodes = ids.map((id) => state.nodes[id])
    return {
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
      selectedCount: ids.length,
      canUngroup: nodes.length === 1 && nodes[0]?.data.name === "Group",
      locked:
        nodes.length > 0 && nodes.every((node) => node.data.custom.locked),
      hidden: nodes.length > 0 && nodes.every((node) => node.data.hidden),
    }
  })
  const hasSelection = selectedCount > 0

  return (
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent className="min-w-56">
        <MenubarGroup>
          <MenubarItem
            disabled={!canUndo}
            onClick={() => actions.history.undo()}
          >
            <Undo2Icon />
            Undo
            <Shortcut keys="Z" />
          </MenubarItem>
          <MenubarItem
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
          >
            <Redo2Icon />
            Redo
            <Shortcut keys="Z" shift />
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem disabled={!hasSelection} onClick={() => copy()}>
            <CopyIcon />
            Copy
            <Shortcut keys="C" />
          </MenubarItem>
          <MenubarItem disabled={!hasSelection} onClick={() => cut()}>
            <ScissorsIcon />
            Cut
            <Shortcut keys="X" />
          </MenubarItem>
          <MenubarItem onClick={() => paste()}>
            <ClipboardIcon />
            Paste
            <Shortcut keys="V" />
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem onClick={() => selectAll()}>
            <SquareDashedIcon />
            Select all
            <Shortcut keys="A" />
          </MenubarItem>
          <MenubarItem disabled={!hasSelection} onClick={() => duplicate()}>
            <CopyIcon />
            Duplicate
            <Shortcut keys="D" />
          </MenubarItem>
          <MenubarItem
            variant="destructive"
            disabled={!hasSelection}
            onClick={() => remove()}
          >
            <Trash2Icon />
            Delete
            <MenubarShortcut>Del</MenubarShortcut>
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Arrange</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarGroup>
              <MenubarItem
                disabled={!hasSelection}
                onClick={() => reorder("forward")}
              >
                <ArrowUpToLineIcon />
                Bring forward
                <Shortcut keys="]" />
              </MenubarItem>
              <MenubarItem
                disabled={!hasSelection}
                onClick={() => reorder("backward")}
              >
                <ArrowDownToLineIcon />
                Send backward
                <Shortcut keys="[" />
              </MenubarItem>
              <MenubarItem
                disabled={!hasSelection}
                onClick={() => reorder("front")}
              >
                <ArrowUpToLineIcon />
                Bring to front
                <Shortcut keys="]" shift />
              </MenubarItem>
              <MenubarItem
                disabled={!hasSelection}
                onClick={() => reorder("back")}
              >
                <ArrowDownToLineIcon />
                Send to back
                <Shortcut keys="[" shift />
              </MenubarItem>
            </MenubarGroup>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Align to slide</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarGroup>
              {ALIGNMENTS.map(([alignment, label]) => (
                <MenubarItem
                  key={alignment}
                  disabled={!hasSelection}
                  onClick={() => align(alignment)}
                >
                  {label}
                </MenubarItem>
              ))}
            </MenubarGroup>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem disabled={selectedCount < 2} onClick={() => group()}>
            <GroupIcon />
            Group
            <Shortcut keys="G" />
          </MenubarItem>
          <MenubarItem disabled={!canUngroup} onClick={() => ungroup()}>
            <UngroupIcon />
            Ungroup
            <Shortcut keys="G" shift />
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem disabled={!hasSelection} onClick={() => toggleLock()}>
            {locked ? <LockOpenIcon /> : <LockIcon />}
            {locked ? "Unlock" : "Lock"}
          </MenubarItem>
          <MenubarItem disabled={!hasSelection} onClick={() => toggleHidden()}>
            {hidden ? <EyeIcon /> : <EyeOffIcon />}
            {hidden ? "Show" : "Hide"}
          </MenubarItem>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}

export { EditMenu }
