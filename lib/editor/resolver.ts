import { ChartBox } from "@/components/editor/nodes/chart-box"
import { CodeBlock } from "@/components/editor/nodes/code-block"
import { Equation } from "@/components/editor/nodes/equation"
import { ImageBox } from "@/components/editor/nodes/image-box"
import { Shape } from "@/components/editor/nodes/shape"
import { Slide } from "@/components/editor/nodes/slide"
import { Table } from "@/components/editor/nodes/table"
import { TextBox } from "@/components/editor/nodes/text-box"

export const resolver = {
  Slide,
  Shape,
  TextBox,
  Equation,
  Table,
  ImageBox,
  CodeBlock,
  ChartBox,
}
