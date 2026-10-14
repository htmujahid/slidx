"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useEditor } from "@craftjs/core"

import { startAutosave } from "@/lib/storage/autosave"
import { Spinner } from "@/components/ui/spinner"
import { useDeck, useEditorStores } from "@/components/editor/editor-stores"
import { useStorage } from "@/components/storage-provider"

const SYNC_DELAY_MS = 250

function useEditorBootstrap() {
  const service = useStorage()
  const router = useRouter()
  const { craft, deck } = useEditorStores()
  const { actions, query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }))

  // Bind craft first: hydrate() below requires it to be bound.
  React.useEffect(() => {
    craft.bind({ actions, query })
    return () => {
      craft.bind(null)
    }
  }, [craft, actions, query])

  React.useEffect(() => {
    const timer = setTimeout(
      () => deck.getState().syncActive(query.serialize()),
      SYNC_DELAY_MS
    )
    return () => clearTimeout(timer)
  }, [deck, nodes, query])

  React.useEffect(() => {
    let cancelled = false
    let stopAutosave: (() => void) | undefined
    const { presentationId } = deck.getState()
    service
      .get(presentationId)
      .catch(() => null)
      .then((stored) => {
        if (cancelled) return
        if (stored === null && service.kind === "cloud") {
          router.replace("/dashboard")
          return
        }
        deck.getState().hydrate(stored)
        stopAutosave = startAutosave({
          deck,
          service,
          persisted: Boolean(stored),
        })
      })
    return () => {
      cancelled = true
      stopAutosave?.()
    }
  }, [deck, service, router])
}

function EditorBootstrap({ children }: { children: React.ReactNode }) {
  useEditorBootstrap()
  const hydrating = useDeck((state) => state.status === "hydrating")
  // Children stay mounted while hydrating: hydrate() needs the live canvas.
  return (
    <div className="grid">
      <div
        className="col-start-1 row-start-1 data-[hydrating]:invisible"
        data-hydrating={hydrating ? "" : undefined}
        inert={hydrating}
      >
        {children}
      </div>
      {hydrating ? (
        <div
          role="status"
          aria-label="Loading presentation"
          className="col-start-1 row-start-1 flex h-dvh items-center justify-center bg-background"
        >
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}

export { EditorBootstrap }
