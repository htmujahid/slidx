export type StoredSlide = { id: string; json: string }

export type StoredPresentation = {
  id: string
  title: string
  slides: StoredSlide[]
}

export type PresentationSummary = {
  id: string
  title: string
  slideCount: number
  updatedAt: number
}

export type SavePresentationInput = {
  title: string
  order: string[]
  changed: StoredSlide[]
}

export type AssetScope = { presentationId?: string }

export type StorageService = {
  readonly kind: "local" | "cloud"
  list(): Promise<PresentationSummary[]>
  get(id: string): Promise<StoredPresentation | null>
  create(input: { title: string; slides: StoredSlide[] }): Promise<string>
  save(id: string, input: SavePresentationInput): Promise<void>
  remove(id: string): Promise<void>
  putAsset(file: Blob, scope?: AssetScope): Promise<string>
  getAssetBlob(id: string): Promise<Blob | null>
  getAssetUrl(id: string): Promise<string | null>
}

export const LOCAL_PRESENTATION_ID = "local"
