"use client"

import { useDraggable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import type { EmailBlock } from "./block-types"
import { GripVertical } from "lucide-react"

interface DraggableBlockItemProps {
  block: EmailBlock
  icon: React.ComponentType<any>
  label: string
  description: string
  onAdd: () => void
}

export function DraggableBlockItem({ block, icon: Icon, label, description, onAdd }: DraggableBlockItemProps) {
  const dragId = `sidebar-${block.type}-${block.id || Date.now()}`
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: {
      type: 'sidebar-block',
      block,
      isFromSidebar: true,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className={`flex border rounded-md transition-colors ${
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-gray-200 bg-transparent hover:bg-gray-50"
      }`}>
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center w-10 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded-l-md border-r border-gray-200"
          {...attributes}
          {...listeners}
          title="Drag to add to canvas"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Content Area - Click to Add */}
        <div 
          className="flex items-center space-x-3 flex-1 p-3 cursor-pointer"
          onClick={onAdd}
        >
          <Icon className="h-5 w-5" />
          <div className="text-left flex-1">
            <div className="font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
          <div className="text-xs text-muted-foreground border border-gray-200 px-2 py-1 rounded">
            Click to add
          </div>
        </div>
      </div>
    </div>
  )
}
