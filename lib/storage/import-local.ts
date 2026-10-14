import { copyAssets } from "@/lib/storage/assets"
import { localService } from "@/lib/storage/local"
import { LOCAL_PRESENTATION_ID, type StorageService } from "@/lib/storage/types"

async function importOnce(target: StorageService) {
  const local = await localService.get(LOCAL_PRESENTATION_ID)
  if (!local) return null

  const id = await target.create({ title: local.title, slides: [] })
  const slides = await Promise.all(
    local.slides.map(async (slide) => ({
      id: slide.id,
      json: await copyAssets(localService, target, slide.json, {
        presentationId: id,
      }),
    }))
  )
  await target.save(id, {
    title: local.title,
    order: slides.map((slide) => slide.id),
    changed: slides,
  })
  await localService.remove(LOCAL_PRESENTATION_ID)
  return id
}

export function importLocalPresentation(target: StorageService) {
  return navigator.locks
    ? navigator.locks.request("visx-import-local", () => importOnce(target))
    : importOnce(target)
}
