import { useState } from "react"
import {
  Element,
  ROOT_NODE,
  useEditor,
  type NodeTree,
} from "@craftjs/core"
import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  animationRegistry,
  isAnimationType,
} from "../craft/animation-registry"
import { definitionMeta } from "../craft/defs/defs-registry"
import {
  getShapeMeta,
  isShapeType,
  shapeRegistry,
  type ShapeComponent,
} from "../craft/shapes"
import {
  clientToSvgPoint,
  dragSource,
  lastDragPosition,
} from "../craft/svg-coords"
import { FiltersTab } from "./filters-tab"
import { NoResults } from "./no-results"

function matches(query: string, ...fields: string[]) {
  return fields.some((field) => field.toLowerCase().includes(query))
}

export function ElementsPanel() {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const { connectors, actions, query: editorQuery } = useEditor()

  const handleShapeCreate =
    (shape: ShapeComponent, point?: { x: number; y: number }) =>
    (tree: NodeTree) => {
      const svg = editorQuery.node(ROOT_NODE).get()?.dom as
        | SVGSVGElement
        | null
      if (svg) {
        const target =
          point ?? clientToSvgPoint(svg, lastDragPosition.x, lastDragPosition.y)
        actions.history
          .merge()
          .setProp(tree.rootNodeId, (props: Record<string, unknown>) =>
            shape.shapeMeta.placeAt(props, target.x, target.y)
          )
      }
      actions.selectNode(tree.rootNodeId)
    }

  const addShapeAtCenter = (shape: ShapeComponent) => {
    const selectedId = editorQuery.getEvent("selected").first()
    const selectedNode = selectedId
      ? editorQuery.node(selectedId).get()
      : null

    const tree = editorQuery
      .parseReactElement(<Element canvas is={shape} />)
      .toNodeTree()

    let container = selectedNode
    while (container) {
      if (definitionMeta(container.data.type)?.shapeChildren) {
        actions.addNodeTree(tree, container.id)
        actions.selectNode(tree.rootNodeId)
        return
      }
      container = container.data.parent
        ? editorQuery.node(container.data.parent).get()
        : null
    }

    const root = editorQuery.node(ROOT_NODE).get()
    if (!root) return
    const props = root.data.props as { width?: number; height?: number }
    actions.addNodeTree(tree, ROOT_NODE)

    const tag = shape.shapeMeta.tag
    if (
      (tag === "use" || tag === "textPath") &&
      selectedId &&
      selectedNode &&
      isShapeType(selectedNode.data.type) &&
      (tag === "use" || getShapeMeta(selectedNode.data.type)?.tag === "path")
    ) {
      actions.history
        .merge()
        .setProp(tree.rootNodeId, (p: Record<string, unknown>) => {
          p.href = `#el-${selectedId}`
        })
    }

    const center = {
      x: (props.width ?? 400) / 2,
      y: (props.height ?? 400) / 2,
    }
    handleShapeCreate(shape, center)(tree)
  }

  const addAnimationToSelection = (component: React.ElementType) => {
    const selected = editorQuery.getEvent("selected").first()
    if (!selected || selected === ROOT_NODE) return
    const node = editorQuery.node(selected).get()
    const parentId = isAnimationType(node.data.type)
      ? node.data.parent
      : selected
    if (!parentId) return
    const AnimationComponent = component as React.ComponentType
    const tree = editorQuery
      .parseReactElement(<AnimationComponent />)
      .toNodeTree()
    actions.addNodeTree(tree, parentId)
    actions.selectNode(tree.rootNodeId)
  }

  const shapes = shapeRegistry.filter((shape) =>
    matches(q, `<${shape.shapeMeta.tag}>`)
  )
  const animations = animationRegistry.filter((animation) =>
    matches(q, `<${animation.tag}>`, animation.description)
  )

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b p-2">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search elements…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>

      <Tabs defaultValue="shapes" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-full shrink-0">
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
          <TabsTrigger value="animate">Animate</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="shapes" className="min-h-0 flex-1">
          {shapes.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-3 gap-2 p-2">
                {shapes.map((shape) => (
                  <button
                    key={shape.shapeMeta.tag}
                    type="button"
                    ref={(ref) => {
                      if (!ref) return
                      connectors.create(
                        ref,
                        <Element canvas is={shape} />,
                        { onCreate: handleShapeCreate(shape) }
                      )
                    }}
                    onClick={() => addShapeAtCenter(shape)}
                    onDragStart={() => {
                      dragSource.kind = "shape"
                    }}
                    onDragEnd={() => {
                      dragSource.kind = null
                    }}
                    title={`Drag onto the canvas or click to add <${shape.shapeMeta.tag}>`}
                    className="flex aspect-square cursor-grab flex-col items-center justify-center gap-1.5 rounded-md border bg-muted/40 select-none hover:border-ring active:cursor-grabbing"
                  >
                    <shape.shapeMeta.icon className="size-5 text-muted-foreground" />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {`<${shape.shapeMeta.tag}>`}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="animate" className="min-h-0 flex-1">
          {animations.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ScrollArea className="h-full">
              <p className="px-3 pt-2 text-xs text-muted-foreground">
                Drag onto a shape on the canvas, or select a shape and click.
              </p>
              <ItemGroup className="p-2">
                {animations.map((animation) => {
                  const AnimationComponent = animation.component
                  return (
                    <Item
                      key={animation.tag}
                      size="sm"
                      ref={(ref: HTMLDivElement | null) => {
                        if (!ref) return
                        connectors.create(ref, <AnimationComponent />, {
                          onCreate: (tree) =>
                            actions.selectNode(tree.rootNodeId),
                        })
                      }}
                      onClick={() =>
                        addAnimationToSelection(animation.component)
                      }
                      onDragStart={() => {
                        dragSource.kind = "animation"
                      }}
                      onDragEnd={() => {
                        dragSource.kind = null
                      }}
                      className="cursor-grab select-none hover:bg-accent active:cursor-grabbing"
                    >
                      <ItemMedia variant="icon">
                        <animation.icon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="font-mono">
                          {`<${animation.tag}>`}
                        </ItemTitle>
                        <ItemDescription>
                          {animation.description}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  )
                })}
              </ItemGroup>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="filters" className="min-h-0 flex-1">
          <FiltersTab q={q} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
