"use client"

import Link from "next/link"
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react"

import { formatRelativeTime } from "@/lib/format-time"
import type { PresentationSummary } from "@/lib/storage/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function PresentationCard({
  presentation,
  onDelete,
}: {
  presentation: PresentationSummary
  onDelete: (presentation: PresentationSummary) => void
}) {
  const { id, title, slideCount, updatedAt } = presentation

  return (
    <Card className="relative transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle className="truncate">
          <Link
            href={`/editor/${id}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription>
          {slideCount} {slideCount === 1 ? "slide" : "slides"} · Edited{" "}
          {formatRelativeTime(updatedAt)}
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative z-10"
                  aria-label={`Actions for ${title}`}
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(presentation)}
                >
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
    </Card>
  )
}

export { PresentationCard }
