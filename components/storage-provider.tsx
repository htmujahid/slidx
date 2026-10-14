"use client"

import * as React from "react"
import { useConvex, useConvexAuth } from "convex/react"

import { parseAssetRef } from "@/lib/storage/assets"
import { createConvexService } from "@/lib/storage/convex"
import { localService } from "@/lib/storage/local"
import type { PresentationSummary, StorageService } from "@/lib/storage/types"

const StorageContext = React.createContext<StorageService | null>(null)

function StorageProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex()
  const { isLoading, isAuthenticated } = useConvexAuth()
  const service = React.useMemo(
    () => (isAuthenticated ? createConvexService(convex) : localService),
    [isAuthenticated, convex]
  )

  if (isLoading) return null

  return (
    <StorageContext.Provider key={service.kind} value={service}>
      {children}
    </StorageContext.Provider>
  )
}

function useStorage() {
  const service = React.useContext(StorageContext)
  if (!service)
    throw new Error("useStorage must be used within StorageProvider.")
  return service
}

type Loaded<T> = { load: () => Promise<T>; reload: number; value: T }

function useLoaded<T>(load: () => Promise<T>, fallback: T, reload = 0) {
  const [state, setState] = React.useState<Loaded<T> | null>(null)

  React.useEffect(() => {
    let active = true
    load().then(
      (value) => active && setState({ load, reload, value }),
      () => active && setState({ load, reload, value: fallback })
    )
    return () => {
      active = false
    }
  }, [load, fallback, reload])

  return state?.load === load && state.reload === reload ? state : null
}

const NO_PRESENTATIONS: PresentationSummary[] = []

function usePresentations() {
  const service = useStorage()
  const [version, setVersion] = React.useState(0)
  const load = React.useCallback(() => service.list(), [service])
  const loaded = useLoaded(load, NO_PRESENTATIONS, version)
  const refresh = React.useCallback(() => setVersion((value) => value + 1), [])
  return { presentations: loaded?.value, refresh }
}

const assetUrls = new WeakMap<
  StorageService,
  Map<string, Promise<string | null>>
>()

function resolveAssetUrl(service: StorageService, id: string) {
  let urls = assetUrls.get(service)
  if (!urls) assetUrls.set(service, (urls = new Map()))
  let url = urls.get(id)
  if (!url) {
    url = service.getAssetUrl(id).catch(() => null)
    urls.set(id, url)
  }
  return url
}

function useAssetSrc(src: string | undefined) {
  const service = React.useContext(StorageContext)
  const id = parseAssetRef(src)
  const [resolved, setResolved] = React.useState<{
    id: string
    url: string | null
  } | null>(null)

  React.useEffect(() => {
    if (!service || !id) return
    let active = true
    resolveAssetUrl(service, id).then(
      (url) => active && setResolved({ id, url })
    )
    return () => {
      active = false
    }
  }, [service, id])

  if (!id) return src
  return resolved?.id === id ? (resolved.url ?? undefined) : undefined
}

export { StorageProvider, useAssetSrc, usePresentations, useStorage }
