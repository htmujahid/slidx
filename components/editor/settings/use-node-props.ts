"use client"

import * as React from "react"
import { useNode } from "@craftjs/core"

const THROTTLE_MS = 400

function useNodeProps<T extends object>(derive?: (props: T) => Partial<T>) {
  const {
    props,
    actions: { setProp },
  } = useNode((node) => ({ props: node.data.props as T }))

  const update = React.useCallback(
    (patch: Partial<T>) => {
      setProp((draft: T) => {
        Object.assign(draft, patch)
        if (derive) Object.assign(draft, derive(draft))
      }, THROTTLE_MS)
    },
    [setProp, derive]
  )

  return { props, update }
}

export { useNodeProps }
