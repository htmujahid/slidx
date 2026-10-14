"use client"

import * as React from "react"
import type { UserComponent } from "@craftjs/core"

import {
  resolveShapeParams,
  SHAPES_BY_KIND,
  type ShapeKind,
} from "@/lib/editor/shapes"
import {
  DEFAULT_TRANSFORM,
  type ElementTransformProps,
} from "@/lib/editor/types"
import { ElementBox, ElementSvg } from "@/components/editor/nodes/element-box"
import { ImageSettings } from "@/components/editor/settings/image-settings"
import { ShapeGeometryElement } from "@/components/editor/shape-geometry"
import { useAssetSrc } from "@/components/storage-provider"

export type ImageBoxProps = ElementTransformProps & {
  src: string
  alt: string
  fit: "cover" | "contain"
  mask: ShapeKind | "none"
  cornerRadius: number
  zoom: number
  focusX: number
  focusY: number
}

const ImageBox: UserComponent<Partial<ImageBoxProps>> = (props) => {
  const {
    src,
    alt,
    fit,
    mask,
    cornerRadius,
    zoom,
    focusX,
    focusY,
    ...transform
  } = {
    ...ImageBox.craft!.props,
    ...props,
  } as ImageBoxProps
  const { width, height } = transform
  const imageSrc = useAssetSrc(src)
  const clipId = `${React.useId().replace(/\W/g, "")}-clip`
  const maskDefinition =
    mask && mask !== "none" && SHAPES_BY_KIND[mask]?.filled
      ? SHAPES_BY_KIND[mask]
      : null

  const layerWidth = width * zoom
  const layerHeight = height * zoom
  const layerX = -(layerWidth - width) * (focusX / 100)
  const layerY = -(layerHeight - height) * (focusY / 100)

  return (
    <ElementBox {...transform}>
      <ElementSvg width={width} height={height}>
        {src ? (
          <>
            <clipPath id={clipId}>
              {maskDefinition ? (
                <ShapeGeometryElement
                  geometry={maskDefinition.geometry(
                    width,
                    height,
                    resolveShapeParams(maskDefinition)
                  )}
                />
              ) : (
                <rect width={width} height={height} rx={cornerRadius} />
              )}
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <image
                href={imageSrc}
                aria-label={alt || undefined}
                role={alt ? "img" : undefined}
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
      </ElementSvg>
    </ElementBox>
  )
}

ImageBox.craft = {
  displayName: "Image",
  props: {
    ...DEFAULT_TRANSFORM,
    width: 640,
    height: 400,
    src: "",
    alt: "",
    fit: "cover",
    mask: "none",
    cornerRadius: 0,
    zoom: 1,
    focusX: 50,
    focusY: 50,
  } satisfies ImageBoxProps,
  custom: { handles: "all" },
  related: { settings: ImageSettings },
}

export { ImageBox }
