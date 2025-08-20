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
            return (
              <Button
                key={layoutType.type}
                variant="outline"
                className="w-full justify-start h-auto p-3 bg-transparent"
                onClick={() => onAddBlock(createBlock(layoutType.type, layoutType.columns))}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{layoutType.label}</div>
                    <div className="text-xs text-muted-foreground">{layoutType.description}</div>
                  </div>
                </div>
              </Button>
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
            return (
              <Button
                key={contentType.type}
                variant="outline"
                className="w-full justify-start h-auto p-3 bg-transparent"
                onClick={() => onAddBlock(createBlock(contentType.type))}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{contentType.label}</div>
                    <div className="text-xs text-muted-foreground">{contentType.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
