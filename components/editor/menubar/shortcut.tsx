"use client"

import * as React from "react"

import { MenubarShortcut } from "@/components/ui/menubar"

const subscribe = () => () => {}
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform)

function Shortcut({ keys, shift }: { keys: string; shift?: boolean }) {
  const mac = React.useSyncExternalStore(subscribe, isMac, () => false)
  return (
    <MenubarShortcut>
      {mac
        ? `${shift ? "⇧" : ""}⌘${keys}`
        : `Ctrl+${shift ? "Shift+" : ""}${keys}`}
    </MenubarShortcut>
  )
}

export { Shortcut }
