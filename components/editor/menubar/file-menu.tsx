"use client"

import { useEditor } from "@craftjs/core"
import {
  FilePlusIcon,
  FileTextIcon,
  FolderOpenIcon,
  GlobeIcon,
  ImageIcon,
  PencilIcon,
  Redo2Icon,
  RotateCcwIcon,
  SaveIcon,
  Undo2Icon,
} from "lucide-react"

import { useFileActions } from "@/hooks/use-file-actions"
import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { Shortcut } from "@/components/editor/menubar/shortcut"

function FileMenu() {
  const { setDialog } = useEditorLayout()
  const { save, open, exportPng, exportSlideHtml, exportPdf, exportHtml } =
    useFileActions()
  const { actions, canUndo, canRedo } = useEditor((_, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  return (
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent className="min-w-60">
        <MenubarGroup>
          <MenubarItem onClick={() => setDialog("new")}>
            <FilePlusIcon />
            New presentation
          </MenubarItem>
          <MenubarItem onClick={open}>
            <FolderOpenIcon />
            Open…
            <Shortcut keys="O" />
          </MenubarItem>
          <MenubarItem onClick={() => setDialog("rename")}>
            <PencilIcon />
            Rename…
          </MenubarItem>
          <MenubarItem onClick={() => setDialog("reset")}>
            <RotateCcwIcon />
            Reset to welcome
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
        <MenubarGroup>
          <MenubarItem onClick={save}>
            <SaveIcon />
            Save to file
            <Shortcut keys="S" />
          </MenubarItem>
          <MenubarItem onClick={exportPng}>
            <ImageIcon />
            Export slide as PNG
          </MenubarItem>
          <MenubarItem onClick={exportSlideHtml}>
            <GlobeIcon />
            Export slide as HTML
          </MenubarItem>
          <MenubarItem onClick={exportPdf}>
            <FileTextIcon />
            Export presentation as PDF
          </MenubarItem>
          <MenubarItem onClick={exportHtml}>
            <GlobeIcon />
            Export presentation as HTML
          </MenubarItem>
        </MenubarGroup>
        <MenubarSeparator />
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
      </MenubarContent>
    </MenubarMenu>
  )
}

export { FileMenu }
