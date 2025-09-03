"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type, ImageIcon, MousePointer, Minus, Space, Columns, Columns2, Columns3 } from "lucide-react"
import type { EmailBlock } from "./block-types"
import {
  createRowBlock,
  createTextBlock,
  createImageBlock,
  createButtonBlock,
  createSpacerBlock,
  createDividerBlock,
} from "./block-types"
import { DraggableBlockItem } from "./draggable-block-item"

interface BlockSidebarProps {
  onAddBlock: (block: EmailBlock) => void
}

export function BlockSidebar({ onAddBlock }: BlockSidebarProps) {
  const layoutTypes = [
    { type: "row-1", label: "1 Column", icon: Columns, description: "Single column layout", columns: 1 },
    { type: "row-2", label: "2 Columns", icon: Columns2, description: "Two column layout", columns: 2 },
    { type: "row-3", label: "3 Columns", icon: Columns3, description: "Three column layout", columns: 3 },
    { type: "row-4", label: "4 Columns", icon: Columns, description: "Four column layout", columns: 4 },
    { type: "row-5", label: "5 Columns", icon: Columns, description: "Five column layout", columns: 5 },
    { type: "row-6", label: "6 Columns", icon: Columns, description: "Six column layout", columns: 6 },
  ]

  const contentTypes = [
    { type: "text", label: "Text", icon: Type, description: "Add text content" },
    { type: "image", label: "Image", icon: ImageIcon, description: "Add an image" },
    { type: "button", label: "Button", icon: MousePointer, description: "Add a call-to-action" },
    { type: "spacer", label: "Spacer", icon: Space, description: "Add vertical spacing" },
    { type: "divider", label: "Divider", icon: Minus, description: "Add a horizontal line" },
  ]

  const createBlock = (type: string, columns?: number): EmailBlock => {
    if (type.startsWith("row-") && columns) {
      return createRowBlock(columns)
    }

    switch (type) {
      case "text":
        return createTextBlock()
      case "image":
        return createImageBlock()
      case "button":
        return createButtonBlock()
      case "spacer":
        return createSpacerBlock()
      case "divider":
        return createDividerBlock()
      default:
        throw new Error(`Unknown block type: ${type}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Layout Blocks */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {layoutTypes.map((layoutType) => {
            const Icon = layoutType.icon
            const block = createBlock(layoutType.type, layoutType.columns)
            return (
              <DraggableBlockItem
                key={layoutType.type}
                block={block}
                icon={Icon}
                label={layoutType.label}
                description={layoutType.description}
                onAdd={() => onAddBlock(block)}
              />
            )
          })}
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contentTypes.map((contentType) => {
            const Icon = contentType.icon
            const block = createBlock(contentType.type)
            return (
              <DraggableBlockItem
                key={contentType.type}
                block={block}
                icon={Icon}
                label={contentType.label}
                description={contentType.description}
                onAdd={() => onAddBlock(block)}
              />
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
