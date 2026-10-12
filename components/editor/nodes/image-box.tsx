"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"

import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { SvgElement } from "@/components/editor/nodes/svg-element"
import { ImageSettings } from "@/components/editor/settings/image-settings"

export type ImageBoxProps = ElementTransformProps & {
  src: string
  fit: "cover" | "contain"
  cornerRadius: number
  zoom: number
  focusX: number
  focusY: number
}

const ImageBox: UserComponent<Partial<ImageBoxProps>> = (props) => {
  const { src, fit, cornerRadius, zoom, focusX, focusY, ...transform } = {
    ...ImageBox.craft!.props,
    ...props,
  } as ImageBoxProps
  const { width, height } = transform
  const clipId = `${React.useId().replace(/\W/g, "")}-clip`

  const layerWidth = width * zoom
  const layerHeight = height * zoom
  const layerX = -(layerWidth - width) * (focusX / 100)
  const layerY = -(layerHeight - height) * (focusY / 100)

  return (
    <SvgElement {...transform}>
      {src ? (
        <>
          <rect width={width} height={height} fill="transparent" />
          <clipPath id={clipId}>
            <rect width={width} height={height} rx={cornerRadius} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <image
              href={src}
              x={layerX}
              y={layerY}
              width={layerWidth}
              height={layerHeight}
              preserveAspectRatio={
                fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"
              }
            />
          </g>
        </>
      ) : (
        <>
          <rect
            width={width}
            height={height}
            rx={12}
            fill="#f4f4f5"
            stroke="#a1a1aa"
            strokeWidth={3}
            strokeDasharray="14 10"
          />
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={36}
            fill="#71717a"
            fontFamily="var(--font-sans), system-ui, sans-serif"
            className="pointer-events-none select-none"
          >
            Add an image
          </text>
        </>
      )}
    </SvgElement>
  )
}

ImageBox.craft = {
  displayName: "Image",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 640,
    height: 400,
    src: "",
    fit: "cover",
    cornerRadius: 0,
    zoom: 1,
    focusX: 50,
    focusY: 50,
  } satisfies ImageBoxProps,
  custom: { handles: "all" },
  related: { settings: ImageSettings },
}

export { ImageBox }
