import { useNode } from "@craftjs/core"

export function useConnectRef() {
  const {
    connectors: { connect },
  } = useNode()
  return (dom: SVGElement | null) => {
    if (dom) connect(dom as unknown as HTMLElement)
  }
}
