import {
  CircleIcon,
  GroupIcon,
  ImageIcon,
  SplineIcon,
  TypeIcon,
} from "lucide-react"

export type TrackKind = "shape" | "path" | "text" | "image" | "group"

export const kindIcons: Record<TrackKind, typeof CircleIcon> = {
  shape: CircleIcon,
  path: SplineIcon,
  text: TypeIcon,
  image: ImageIcon,
  group: GroupIcon,
}
