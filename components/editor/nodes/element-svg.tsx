"use client"

import * as React from "react"

function ElementSvg({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: React.ReactNode
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
      style={{ position: "absolute", left: 0, top: 0, display: "block" }}
    >
      {children}
    </svg>
  )
}

export { ElementSvg }
