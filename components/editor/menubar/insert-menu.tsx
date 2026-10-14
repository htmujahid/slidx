"use client"

import * as React from "react"

import { LIBRARY } from "@/lib/editor/library/items"
import { LIBRARY_GROUPS, type LibraryItem } from "@/lib/editor/library/types"
import { useEditorActions } from "@/hooks/use-editor-actions"
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

function InsertItem({ item }: { item: LibraryItem }) {
  const { addLibraryItem } = useEditorActions()
  return (
    <MenubarItem onClick={() => addLibraryItem(item.id)}>
      <item.icon />
      {item.label}
    </MenubarItem>
  )
}

const MENU_GROUPS = LIBRARY_GROUPS.filter((group) => group.id !== "shape")

function InsertMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger>Insert</MenubarTrigger>
      <MenubarContent className="min-w-48">
        {MENU_GROUPS.map((group, index) => {
          const items = LIBRARY.filter((item) => item.group === group.id)
          if (items.length === 0) return null
          const separator = index > 0 ? <MenubarSeparator /> : null

          if (items.length === 1) {
            return (
              <React.Fragment key={group.id}>
                {separator}
                <InsertItem item={items[0]} />
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={group.id}>
              {separator}
              <MenubarSub>
                <MenubarSubTrigger>{group.label}</MenubarSubTrigger>
                <MenubarSubContent>
                  {items.map((item) => (
                    <InsertItem key={item.id} item={item} />
                  ))}
                </MenubarSubContent>
              </MenubarSub>
            </React.Fragment>
          )
        })}
      </MenubarContent>
    </MenubarMenu>
  )
}

export { InsertMenu }
