import type { AssetScope, StorageService } from "@/lib/storage/types"

const ASSET_PREFIX = "asset:"
const ASSET_REF = /asset:[A-Za-z0-9_-]+/g
const DATA_URL = /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g
const MAX_SLIDE_BYTES = 900_000

export const toAssetRef = (id: string) => `${ASSET_PREFIX}${id}`

export const parseAssetRef = (value: string | undefined) =>
  value?.startsWith(ASSET_PREFIX) ? value.slice(ASSET_PREFIX.length) : null

export function assertSlideSize(json: string) {
  if (new Blob([json]).size > MAX_SLIDE_BYTES) {
    throw new Error("This slide is too large to save.")
  }
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

async function replaceAsync(
  text: string,
  pattern: RegExp,
  replace: (match: string) => Promise<string>
) {
  const matches = [...new Set(text.match(pattern) ?? [])]
  const replacements = new Map(
    await Promise.all(
      matches.map(async (match) => [match, await replace(match)] as const)
    )
  )
  return text.replace(pattern, (match) => replacements.get(match) ?? match)
}

export function inlineAssets(service: StorageService, json: string) {
  return replaceAsync(json, ASSET_REF, async (ref) => {
    const blob = await service.getAssetBlob(ref.slice(ASSET_PREFIX.length))
    return blob ? blobToDataUrl(blob) : ref
  })
}

export function externalizeAssets(
  service: StorageService,
  json: string,
  scope?: AssetScope
) {
  return replaceAsync(json, DATA_URL, async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob()
    return toAssetRef(await service.putAsset(blob, scope))
  })
}

export async function copyAssets(
  from: StorageService,
  to: StorageService,
  json: string,
  scope?: AssetScope
) {
  return replaceAsync(json, ASSET_REF, async (ref) => {
    const blob = await from.getAssetBlob(ref.slice(ASSET_PREFIX.length))
    return blob ? toAssetRef(await to.putAsset(blob, scope)) : ref
  })
}
