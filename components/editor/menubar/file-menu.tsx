"use client"

import {
  FilePlusIcon,
  FileTextIcon,
  FolderOpenIcon,
  GlobeIcon,
  ImageIcon,
  PencilIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react"

import { useChrome } from "@/lib/editor/stores/chrome-store"
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
import { Shortcut } from "@/components/editor/menubar/shortcut"

function FileMenu() {
  const setDialog = useChrome((state) => state.setDialog)
  const { save, open, exportPng, exportSlideHtml, exportPdf, exportHtml } =
    useFileActions()

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
              <ImageIcon />
              Export slide
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={exportPng}>
                <ImageIcon />
                PNG image
              </MenubarItem>
              <MenubarItem onClick={exportSlideHtml}>
                <GlobeIcon />
                HTML page
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>
              <FileTextIcon />
              Export presentation
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={exportPdf}>
                <FileTextIcon />
                PDF document
              </MenubarItem>
              <MenubarItem onClick={exportHtml}>
                <GlobeIcon />
                HTML page
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}

export { FileMenu }
