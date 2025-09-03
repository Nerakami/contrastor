"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { ContentBlock } from "./block-types"
import { ContentBlockModal } from "./content-block-modal"

interface ColumnDropZoneProps {
  columnId: string
  onAddContent: (contentBlock: ContentBlock) => void
}

export function ColumnDropZone({ columnId, onAddContent }: ColumnDropZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}`,
    data: { columnId },
  })

  return (
    <>
      <div
        ref={setNodeRef}
        className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
          isOver ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
      >
        <div className="flex flex-col items-center space-y-3">
          <Plus className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500">Drop content here</span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="text-xs"
          >
            Add Content
          </Button>
        </div>
      </div>

      <ContentBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddContent}
      />
    </>
  )
}
