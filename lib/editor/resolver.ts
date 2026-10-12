import { ArrowLine } from "@/components/editor/nodes/arrow-line"
import { ChartBox } from "@/components/editor/nodes/chart-box"
import { CodeBlock } from "@/components/editor/nodes/code-block"
import { EmojiBox } from "@/components/editor/nodes/emoji-box"
import { Equation } from "@/components/editor/nodes/equation"
import { Group } from "@/components/editor/nodes/group"
import { IconBox } from "@/components/editor/nodes/icon-box"
import { ImageBox } from "@/components/editor/nodes/image-box"
import { Shape } from "@/components/editor/nodes/shape"
import { Slide } from "@/components/editor/nodes/slide"
import { Table } from "@/components/editor/nodes/table"
import { TextBox } from "@/components/editor/nodes/text-box"

export const resolver = {
  Slide,
  Group,
  Shape,
  TextBox,
  Equation,
  Table,
  ImageBox,
  CodeBlock,
  ChartBox,
  IconBox,
  EmojiBox,
  ArrowLine,
}
