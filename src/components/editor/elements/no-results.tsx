import { SearchIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NoResults({ query }: { query: string }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No elements found</EmptyTitle>
        <EmptyDescription>
          No results for &ldquo;{query}&rdquo;.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
