"use client"

import * as React from "react"

function SettingsRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

export { SettingsRow }
