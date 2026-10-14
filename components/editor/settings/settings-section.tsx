"use client"

import * as React from "react"

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <AccordionItem value={title} className="-mx-1">
      <AccordionTrigger className="px-1">{title}</AccordionTrigger>
      <AccordionContent className="px-1 pt-1 pb-4">
        <FieldSet className="gap-3">
          <FieldLegend className="sr-only" variant="label">
            {title}
          </FieldLegend>
          <FieldGroup className="gap-3 [&_[data-slot=field-label]]:whitespace-nowrap [&_[data-slot=field]]:min-w-0">
            {children}
          </FieldGroup>
        </FieldSet>
      </AccordionContent>
    </AccordionItem>
  )
}

export { SettingsSection }
