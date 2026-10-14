import { api } from "@/convex/_generated/api"
import type { ConvexReactClient } from "convex/react"

import { withCompression } from "@/lib/storage/compress"
import type { StorageService } from "@/lib/storage/types"

export function createConvexService(client: ConvexReactClient): StorageService {
  return withCompression(createRawService(client))
}

function createRawService(client: ConvexReactClient): StorageService {
  const getAssetUrl = (id: string) => client.query(api.assets.url, { id })

  return {
    kind: "cloud",
    list: () => client.query(api.presentations.list, {}),
    get: (id) => client.query(api.presentations.get, { id }),
    create: (input) => client.mutation(api.presentations.create, input),
    async save(id, input) {
      await client.mutation(api.presentations.save, { id, ...input })
    },
    async remove(id) {
      await client.mutation(api.presentations.remove, { id })
    },

    async putAsset(file, scope) {
      const uploadUrl = await client.mutation(api.assets.generateUploadUrl, {})
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      })
      if (!response.ok) throw new Error("The image could not be uploaded.")
      const { storageId } = await response.json()
      return client.mutation(api.assets.register, {
        storageId,
        presentationId: scope?.presentationId,
      })
    },

    getAssetUrl,

    async getAssetBlob(id) {
      const url = await getAssetUrl(id)
      if (!url) return null
      const response = await fetch(url)
      return response.ok ? response.blob() : null
    },
  }
}
