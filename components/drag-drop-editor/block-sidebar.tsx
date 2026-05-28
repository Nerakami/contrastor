"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, ImageIcon, MousePointer, Minus, Space, Columns, Columns2, Columns3 } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"

interface DraggableItemProps {
  id: string
  type: string
  label: string
  description: string
  icon: any
  columns?: number
}

function DraggableItem({ id, type, label, description, icon: Icon, columns }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      source: "sidebar",
      type,
      columns,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="w-full justify-start h-auto p-3 border rounded-lg bg-transparent hover:bg-accent/50 transition-colors">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BlockSidebar() {
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

  return (
    <div className="space-y-4">
      {/* Layout Blocks */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {layoutTypes.map((layoutType) => (
            <DraggableItem
              key={layoutType.type}
              id={`sidebar-${layoutType.type}`}
              type={layoutType.type}
              label={layoutType.label}
              description={layoutType.description}
              icon={layoutType.icon}
              columns={layoutType.columns}
            />
          ))}
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contentTypes.map((contentType) => (
            <DraggableItem
              key={contentType.type}
              id={`sidebar-${contentType.type}`}
              type={contentType.type}
              label={contentType.label}
              description={contentType.description}
              icon={contentType.icon}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
