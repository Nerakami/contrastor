"use client"

import { BlockRenderer } from "./block-renderer"
import type { EmailBlock } from "./block-types"
import { GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface DraggableBlockProps {
  block: EmailBlock
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  onDeleteContentFromColumn?: (columnId: string, contentId: string) => void
  onEditContentInColumn?: (columnId: string, contentId: string) => void
}

export function DraggableBlock({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onDeleteContentFromColumn,
  onEditContentInColumn,
}: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      source: "canvas",
      index,
      blockId: block.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <div className="bg-white border rounded p-1 shadow-sm">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <BlockRenderer
        block={block}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        onEdit={onEdit}
        onDeleteContentFromColumn={onDeleteContentFromColumn}
        onEditContentInColumn={onEditContentInColumn}
      />
    </div>
  )
}
