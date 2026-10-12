"use client"

import { Menubar } from "@/components/ui/menubar"
import { EditMenu } from "@/components/editor/menubar/edit-menu"
import { FileMenu } from "@/components/editor/menubar/file-menu"
import { InsertMenu } from "@/components/editor/menubar/insert-menu"
import { SlideMenu } from "@/components/editor/menubar/slide-menu"
import { ViewMenu } from "@/components/editor/menubar/view-menu"

function EditorMenubar() {
  return (
    <Menubar className="border-0 bg-transparent p-0 shadow-none">
      <FileMenu />
      <EditMenu />
      <ViewMenu />
      <InsertMenu />
      <SlideMenu />
    </Menubar>
  )
}

export { EditorMenubar }
