"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { Columns, Columns2, Columns3, Type, ImageIcon, MousePointerClick, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DraggableBlockProps {
  id: string
  icon: React.ReactNode
  label: string
}

function DraggableBlock({ id, icon, label }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: id },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-all ${
        isDragging
          ? "opacity-50 cursor-grabbing scale-105 border-primary bg-primary/10"
          : "cursor-grab hover:border-primary hover:bg-accent"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  )
}

export function LeftSidebar() {
  return (
    <Card className="w-64 h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Components</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Structure</h3>
            <div className="grid grid-cols-2 gap-2">
              <DraggableBlock id="section-1" icon={<Columns className="h-6 w-6" />} label="1 Column" />
              <DraggableBlock id="section-2" icon={<Columns2 className="h-6 w-6" />} label="2 Columns" />
              <DraggableBlock id="section-3" icon={<Columns3 className="h-6 w-6" />} label="3 Columns" />
              <DraggableBlock id="section-4" icon={<Columns3 className="h-6 w-6" />} label="4 Columns" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Content</h3>
            <div className="grid grid-cols-2 gap-2">
              <DraggableBlock id="content-text" icon={<Type className="h-6 w-6" />} label="Text" />
              <DraggableBlock id="content-image" icon={<ImageIcon className="h-6 w-6" />} label="Image" />
              <DraggableBlock id="content-button" icon={<MousePointerClick className="h-6 w-6" />} label="Button" />
              <DraggableBlock id="content-divider" icon={<Minus className="h-6 w-6" />} label="Divider" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  )
}
