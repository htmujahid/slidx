"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon, PresentationIcon, SearchIcon } from "lucide-react"

import { importLocalPresentation } from "@/lib/storage/import-local"
import type { PresentationSummary } from "@/lib/storage/types"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { DeletePresentationDialog } from "@/components/dashboard/delete-presentation-dialog"
import { PresentationCard } from "@/components/dashboard/presentation-card"
import { AccountMenu } from "@/components/editor/account-menu"
import { Brand } from "@/components/editor/brand"
import { ThemeToggle } from "@/components/editor/theme-toggle"
import { usePresentations, useStorage } from "@/components/storage-provider"

type SortKey = "recent" | "name" | "slides"

const SORTS: Record<
  SortKey,
  (a: PresentationSummary, b: PresentationSummary) => number
> = {
  recent: (a, b) => b.updatedAt - a.updatedAt,
  name: (a, b) => a.title.localeCompare(b.title),
  slides: (a, b) => b.slideCount - a.slideCount,
}

function NewPresentationButton() {
  return (
    <Button render={<Link href="/editor/new" />} nativeButton={false}>
      <PlusIcon data-icon="inline-start" />
      New presentation
    </Button>
  )
}

function Dashboard() {
  const storage = useStorage()
  const { presentations, refresh } = usePresentations()
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortKey>("recent")
  const [deleting, setDeleting] = React.useState<PresentationSummary | null>(
    null
  )
  const importedRef = React.useRef(false)

  React.useEffect(() => {
    if (importedRef.current) return
    importedRef.current = true
    importLocalPresentation(storage).then(
      (id) => {
        if (!id) return
        refresh()
        toast.add({
          type: "success",
          title: "Your local presentation was added to your account",
        })
      },
      () =>
        toast.add({
          type: "error",
          title: "Could not import your local presentation",
        })
    )
  }, [storage, refresh])

  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return (presentations ?? [])
      .filter((presentation) =>
        presentation.title.toLowerCase().includes(query)
      )
      .sort(SORTS[sort])
  }, [presentations, search, sort])

  const remove = async (presentation: PresentationSummary) => {
    try {
      await storage.remove(presentation.id)
      setDeleting(null)
      refresh()
      toast.add({ type: "success", title: `Deleted “${presentation.title}”` })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not delete the presentation",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  let content: React.ReactNode
  if (!presentations) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-52 rounded-xl" />
        ))}
      </div>
    )
  } else if (!presentations.length) {
    content = (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PresentationIcon />
          </EmptyMedia>
          <EmptyTitle>No presentations yet</EmptyTitle>
          <EmptyDescription>
            Create your first presentation to see it here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewPresentationButton />
        </EmptyContent>
      </Empty>
    )
  } else if (!visible.length) {
    content = (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>No matches</EmptyTitle>
          <EmptyDescription>
            Nothing is titled “{search.trim()}”.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </EmptyContent>
      </Empty>
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((presentation) => (
          <PresentationCard
            key={presentation.id}
            presentation={presentation}
            onDelete={setDeleting}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <Brand />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {presentations
                ? `${presentations.length} ${presentations.length === 1 ? "presentation" : "presentations"}`
                : "Loading…"}
            </p>
          </div>
          <NewPresentationButton />
        </div>
        {presentations?.length ? (
          <div className="flex flex-wrap gap-2">
            <InputGroup className="max-w-sm min-w-48 flex-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search presentations"
                placeholder="Search presentations…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </InputGroup>
            <NativeSelect
              className="ml-auto"
              aria-label="Sort presentations"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              <NativeSelectOption value="recent">
                Last edited
              </NativeSelectOption>
              <NativeSelectOption value="name">Name</NativeSelectOption>
              <NativeSelectOption value="slides">
                Most slides
              </NativeSelectOption>
            </NativeSelect>
          </div>
        ) : null}
        {content}
      </main>
      <DeletePresentationDialog
        presentation={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  )
}

export { Dashboard }
