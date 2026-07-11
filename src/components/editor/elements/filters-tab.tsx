import { createElement } from "react"
import { Element, ROOT_NODE, useEditor, type Node } from "@craftjs/core"
import { SlidersHorizontalIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { applyEffect, clearEffectRefs } from "../craft/defs/apply-effect"
import {
  isFilterPrimitiveType,
  type FilterPrimitiveComponent,
} from "../craft/defs/create-filter-primitive"
import {
  EFFECT_MIME,
  definitionMeta,
  isDefsType,
  type DefinitionKind,
} from "../craft/defs/defs-registry"
import { effectPresets, type EffectPreset } from "../craft/defs/presets"
import { filterPrimitiveRegistry } from "../craft/defs/primitive-registry"
import { SvgDefs } from "../craft/defs/svg-defs"
import { SvgFilter } from "../craft/defs/svg-filter"
import { isShapeType } from "../craft/shapes"
import { NoResults } from "./no-results"
import { SectionLabel } from "./section-label"

function matches(query: string, ...fields: string[]) {
  return fields.some((field) => field.toLowerCase().includes(query))
}

type ChildEntry = { id: string; label: string; depth: number }

type DefinedEntry = {
  id: string
  kind: DefinitionKind
  name: string
  displayName: string
  children: ChildEntry[]
}

export function FiltersTab({ q }: { q: string }) {
  const { actions, query: editorQuery, defined, defsId, selectedId } =
    useEditor((state, query) => {
      const rootIds = (state.nodes[ROOT_NODE]?.data.nodes ?? []) as string[]
      const defsId = rootIds.find((id) =>
        isDefsType(state.nodes[id]?.data.type)
      )

      const walkChildren = (ids: string[], depth: number): ChildEntry[] =>
        ids.flatMap((id) => {
          const node = state.nodes[id]
          if (!node) return []
          return [
            { id, label: node.data.displayName, depth },
            ...walkChildren((node.data.nodes ?? []) as string[], depth + 1),
          ]
        })

      const defined: DefinedEntry[] = defsId
        ? ((state.nodes[defsId].data.nodes ?? []) as string[]).flatMap(
            (id) => {
              const node = state.nodes[id]
              const meta = node && definitionMeta(node.data.type)
              if (!meta) return []
              return [
                {
                  id,
                  kind: meta.kind,
                  name:
                    (node.data.props as { name?: string }).name ?? meta.kind,
                  displayName: node.data.displayName,
                  children: walkChildren(
                    (node.data.nodes ?? []) as string[],
                    1
                  ),
                },
              ]
            }
          )
        : []

      return {
        defined,
        defsId,
        selectedId: query.getEvent("selected").first(),
      }
    })

  const createFromPreset = (preset: EffectPreset) => {
    let parentId = defsId
    if (!parentId) {
      const defsTree = editorQuery
        .parseReactElement(<Element canvas is={SvgDefs} />)
        .toNodeTree()
      actions.addNodeTree(defsTree, ROOT_NODE)
      parentId = defsTree.rootNodeId
    }
    const name = `${preset.label.toLowerCase()} ${defined.length + 1}`
    const tree = editorQuery.parseReactElement(preset.create(name)).toNodeTree()
    actions.addNodeTree(tree, parentId)
    actions.selectNode(tree.rootNodeId)
    toast.success(`Defined "${name}" — drop it on a shape's track to apply`)
  }

  const applyToSelection = (defId: string) => {
    if (!selectedId || selectedId === ROOT_NODE) {
      toast.info("Select a shape first, then click an effect to apply it")
      return
    }
    const target = editorQuery.node(selectedId).get()
    if (!isShapeType(target.data.type)) {
      toast.info("Effects apply to shapes — select one on the canvas")
      return
    }
    applyEffect(actions, editorQuery, selectedId, defId)
  }

  const deleteDefinition = (defId: string) => {
    clearEffectRefs(actions, editorQuery, defId)
    actions.delete(defId)
  }

  const addPrimitive = (component: FilterPrimitiveComponent) => {
    const meta = component.primitiveMeta
    let cursor: Node | null = selectedId
      ? editorQuery.node(selectedId).get()
      : null
    let targetId: string | null = null
    while (cursor) {
      const type = cursor.data.type
      if (meta.parentTags) {
        if (
          isFilterPrimitiveType(type) &&
          meta.parentTags.includes(type.primitiveMeta.tag)
        ) {
          targetId = cursor.id
          break
        }
      } else if (type === SvgFilter) {
        targetId = cursor.id
        break
      }
      cursor = cursor.data.parent
        ? editorQuery.node(cursor.data.parent).get()
        : null
    }
    if (!targetId) {
      toast.info(
        meta.parentTags
          ? `Select a <${meta.parentTags.join("> or <")}> first`
          : "Select a defined filter first to add primitives to it"
      )
      return
    }
    const element = meta.container ? (
      <Element canvas is={component} />
    ) : (
      createElement(component)
    )
    const tree = editorQuery.parseReactElement(element).toNodeTree()
    actions.addNodeTree(tree, targetId)
    actions.selectNode(tree.rootNodeId)
  }

  const presets = effectPresets.filter((preset) =>
    matches(q, preset.label, preset.description)
  )
  const definitions = defined.filter((def) =>
    matches(q, def.name, `<${def.displayName}>`)
  )
  const primitives = filterPrimitiveRegistry.filter((primitive) =>
    matches(
      q,
      `<${primitive.primitiveMeta.tag}>`,
      primitive.primitiveMeta.description
    )
  )

  if (
    presets.length === 0 &&
    definitions.length === 0 &&
    primitives.length === 0
  ) {
    return <NoResults query={q} />
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {definitions.length > 0 && (
          <>
            <SectionLabel>Defined in document</SectionLabel>
            <p className="px-1 pb-1 text-xs text-muted-foreground">
              Click to apply to the selected shape, or drag onto a timeline
              track.
            </p>
            <ItemGroup>
              {definitions.map((def) => {
                const meta = definitionMeta(
                  editorQuery.node(def.id).get()?.data.type
                )
                const DefIcon = meta?.icon ?? SlidersHorizontalIcon
                return (
                  <div key={def.id}>
                    <Item
                      size="sm"
                      draggable
                      onDragStart={(event: React.DragEvent) => {
                        event.dataTransfer.effectAllowed = "copy"
                        event.dataTransfer.setData(EFFECT_MIME, def.id)
                      }}
                      onClick={() => applyToSelection(def.id)}
                      className={cn(
                        "cursor-grab select-none hover:bg-accent active:cursor-grabbing",
                        selectedId === def.id && "bg-accent"
                      )}
                    >
                      <ItemMedia variant="icon">
                        <DefIcon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{def.name}</ItemTitle>
                        <ItemDescription className="font-mono">
                          {`<${def.displayName}>`}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            actions.selectNode(def.id)
                          }}
                        >
                          <SlidersHorizontalIcon />
                          <span className="sr-only">Edit {def.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive"
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteDefinition(def.id)
                          }}
                        >
                          <Trash2Icon />
                          <span className="sr-only">Delete {def.name}</span>
                        </Button>
                      </ItemActions>
                    </Item>
                    {def.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => actions.selectNode(child.id)}
                        className={cn(
                          "flex w-full items-center rounded-sm py-0.5 pr-2 font-mono text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
                          selectedId === child.id &&
                            "bg-accent text-foreground"
                        )}
                        style={{ paddingLeft: 8 + child.depth * 14 }}
                      >
                        {`<${child.label}>`}
                      </button>
                    ))}
                  </div>
                )
              })}
            </ItemGroup>
          </>
        )}

        {presets.length > 0 && (
          <>
            <SectionLabel>Presets</SectionLabel>
            <ItemGroup>
              {presets.map((preset) => (
                <Item
                  key={preset.id}
                  size="sm"
                  onClick={() => createFromPreset(preset)}
                  className="cursor-pointer select-none hover:bg-accent"
                >
                  <ItemMedia variant="icon">
                    <preset.icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{preset.label}</ItemTitle>
                    <ItemDescription>{preset.description}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </>
        )}

        {primitives.length > 0 && (
          <>
            <SectionLabel>Filter primitives</SectionLabel>
            <p className="px-1 pb-1 text-xs text-muted-foreground">
              Select a defined filter (or container primitive), then click to
              add to its chain.
            </p>
            <ItemGroup>
              {primitives.map((primitive) => (
                <Item
                  key={primitive.primitiveMeta.tag}
                  size="sm"
                  onClick={() => addPrimitive(primitive)}
                  className="cursor-pointer select-none hover:bg-accent"
                >
                  <ItemMedia variant="icon">
                    <SlidersHorizontalIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="font-mono">
                      {`<${primitive.primitiveMeta.tag}>`}
                    </ItemTitle>
                    <ItemDescription>
                      {primitive.primitiveMeta.description}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
