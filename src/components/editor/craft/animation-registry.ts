import type { UserComponent } from "@craftjs/core"
import { MoveIcon, RouteIcon, TimerIcon, ZapIcon } from "lucide-react"

import {
  SvgAnimate,
  SvgAnimateMotion,
  SvgAnimateTransform,
  SvgSet,
} from "./animations"

export type AnyUserComponent = UserComponent<Record<string, unknown>>

export type AnimationMeta = {
  component: AnyUserComponent
  tag: string
  icon: typeof ZapIcon
  description: string
  clipLabel: (props: Record<string, unknown>) => string
}

export const animationRegistry: AnimationMeta[] = [
  {
    component: SvgAnimate as AnyUserComponent,
    tag: "animate",
    icon: ZapIcon,
    description: "Animate any attribute over time",
    clipLabel: (props) => String(props.attributeName ?? "animate"),
  },
  {
    component: SvgAnimateTransform as AnyUserComponent,
    tag: "animateTransform",
    icon: MoveIcon,
    description: "Translate, rotate, scale or skew",
    clipLabel: (props) => String(props.type ?? "transform"),
  },
  {
    component: SvgAnimateMotion as AnyUserComponent,
    tag: "animateMotion",
    icon: RouteIcon,
    description: "Move an element along a path",
    clipLabel: () => "motion",
  },
  {
    component: SvgSet as AnyUserComponent,
    tag: "set",
    icon: TimerIcon,
    description: "Set a value at a point in time",
    clipLabel: (props) => `set ${String(props.attributeName ?? "")}`,
  },
]

export function getAnimationMeta(type: unknown) {
  return animationRegistry.find((meta) => meta.component === type)
}

export function isAnimationType(type: unknown) {
  return animationRegistry.some((meta) => meta.component === type)
}
