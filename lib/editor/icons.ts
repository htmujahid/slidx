import { icons, type LucideIcon } from "lucide-react"

const toKebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()

/** Every lucide icon, keyed by kebab-case name (the value stored on nodes). */
export const ICONS: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(icons).map(([name, Icon]) => [toKebab(name), Icon])
)

export const ICON_NAMES = Object.keys(ICONS).sort()

export type IconName = string

export const DEFAULT_ICON = "star"
