import { compress, decompress } from "lzutf8"

const SHARE_PARAM = "s"

export function buildShareUrl(serializedState: string) {
  const encoded = compress(serializedState, { outputEncoding: "Base64" })
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${SHARE_PARAM}=${encodeURIComponent(encoded)}`
}

export function readSharedState(): string | null {
  const match = window.location.hash.match(
    new RegExp(`[#&]${SHARE_PARAM}=([^&]+)`)
  )
  if (!match) return null
  try {
    const json = decompress(decodeURIComponent(match[1]), {
      inputEncoding: "Base64",
    })
    JSON.parse(json)
    return json
  } catch {
    return null
  }
}
