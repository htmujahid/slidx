"use client"

import { useEditor } from "@craftjs/core"
import {
  DownloadIcon,
  FileCodeIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderOpenIcon,
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
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useEditorLayout } from "@/components/editor/editor-layout"
import { Shortcut } from "@/components/editor/menubar/shortcut"

function FileMenu() {
  const { setDialog } = useEditorLayout()
  const { save, open, exportSlide, exportPdf } = useFileActions()
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
          <MenubarSub>
            <MenubarSubTrigger>
              <DownloadIcon />
              Export slide
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => exportSlide("svg")}>
                <FileCodeIcon />
                SVG image
              </MenubarItem>
              <MenubarItem onClick={() => exportSlide("png")}>
                <ImageIcon />
                PNG image
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem onClick={exportPdf}>
            <FileTextIcon />
            Export as PDF
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
