"use client"

import { useEditor } from "@craftjs/core"
import {
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  ClipboardIcon,
  CopyIcon,
  ScissorsIcon,
  SquareDashedIcon,
  Trash2Icon,
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
  const { duplicate, remove, copy, cut, paste, selectAll, reorder, align } =
    useEditorActions()
  const { hasSelection } = useEditor((state) => ({
    hasSelection: [...state.events.selected].some((id) => id !== "ROOT"),
  }))

  return (
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent className="min-w-56">
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
          <MenubarItem disabled={!hasSelection} onClick={() => reorder("back")}>
            <ArrowDownToLineIcon />
            Send to back
            <Shortcut keys="[" shift />
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger disabled={!hasSelection}>
            Align to slide
          </MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarGroup>
              {ALIGNMENTS.map(([alignment, label]) => (
                <MenubarItem key={alignment} onClick={() => align(alignment)}>
                  {label}
                </MenubarItem>
              ))}
            </MenubarGroup>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>
  )
}

export { EditMenu }
