export type BackgroundType = "solid" | "image"
export type ImageFit = "cover" | "contain"

export type SlideProps = {
  backgroundType: BackgroundType
  background: string
  backgroundImage: string
  imageFit: ImageFit
  showGrid: boolean
  gridSize: number
  snapToGrid: boolean
  snapToAlignment: boolean
}

export const SLIDE_DEFAULTS: SlideProps = {
  backgroundType: "solid",
  background: "#ffffff",
  backgroundImage: "",
  imageFit: "cover",
  showGrid: false,
  gridSize: 40,
  snapToGrid: false,
  snapToAlignment: true,
}
