import lz from "lzutf8"

import { assertSlideSize } from "@/lib/storage/assets"
import type { StorageService, StoredSlide } from "@/lib/storage/types"

const compress = (json: string) => lz.encodeBase64(lz.compress(json))

const decompress = (data: string) => lz.decompress(lz.decodeBase64(data))

const pack = ({ id, json }: StoredSlide): StoredSlide => {
  const packed = compress(json)
  assertSlideSize(packed)
  return { id, json: packed }
}

export function withCompression(service: StorageService): StorageService {
  return {
    ...service,
    async get(id) {
      const stored = await service.get(id)
      return (
        stored && {
          ...stored,
          slides: stored.slides.map(({ id, json }) => ({
            id,
            json: decompress(json),
          })),
        }
      )
    },
    create: ({ title, slides }) =>
      service.create({ title, slides: slides.map(pack) }),
    save: (id, input) =>
      service.save(id, { ...input, changed: input.changed.map(pack) }),
  }
}
