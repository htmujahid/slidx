"use client"

import * as React from "react"

import { useChrome } from "@/lib/editor/stores/chrome-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider } from "@/components/ui/sidebar"

function PropertiesSidebar({ children }: { children: React.ReactNode }) {
  const propertiesOpen = useChrome((state) => state.propertiesOpen)
  const setPropertiesOpen = useChrome((state) => state.setPropertiesOpen)
  const isMobile = useIsMobile()
  return (
    <SidebarProvider
      open={propertiesOpen}
      openMobile={isMobile && propertiesOpen}
      onOpenMobileChange={(next) =>
        setPropertiesOpen(
          typeof next === "function" ? next(propertiesOpen) : next
        )
      }
      onOpenChange={setPropertiesOpen}
      className="min-h-0 min-w-0 flex-1"
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      {children}
    </SidebarProvider>
  )
}

export { PropertiesSidebar }
