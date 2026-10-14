"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useEditor } from "@craftjs/core"

import { startAutosave } from "@/lib/storage/autosave"
import { useDeck, useEditorStores } from "@/components/editor/editor-stores"
import { useStorage } from "@/components/storage-provider"

const SYNC_DELAY_MS = 250
function CraftBridge() {
  const { craft } = useEditorStores()
  const { actions, query } = useEditor()
  React.useEffect(() => {
    craft.bind({ actions, query })
    return () => {
      craft.bind(null)
    }
  }, [craft, actions, query])
  return null
}
function ActiveSlideSync() {
  const { deck } = useEditorStores()
  const { query, nodes } = useEditor((state) => ({ nodes: state.nodes }))
  React.useEffect(() => {
    const timer = setTimeout(
      () => deck.getState().syncActive(query.serialize()),
      SYNC_DELAY_MS
    )
    return () => clearTimeout(timer)
  }, [deck, nodes, query])
  return null
}
function EditorBootstrap() {
  const service = useStorage()
  const router = useRouter()
  const { deck } = useEditorStores()
  const hydrating = useDeck((state) => state.status === "hydrating")

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

  return hydrating ? <div className="fixed inset-0 z-50 bg-background" /> : null
}

export { ActiveSlideSync, CraftBridge, EditorBootstrap }
