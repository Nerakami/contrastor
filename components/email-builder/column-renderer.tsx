"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEmailBuilderStore, type Column } from "@/lib/email-builder/store"
import { ContentRenderer } from "./content-renderer"
import { GripVertical, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnRendererProps {
  column: Column
  sectionId: string
  verticalAlign: "top" | "middle" | "bottom"
}

export function ColumnRenderer({ column, sectionId, verticalAlign }: ColumnRendererProps) {
  const { selectElement, selectedElementId, removeColumn, duplicateColumn } = useEmailBuilderStore()
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", sectionId, columnId: column.id },
  })

  const isSelected = selectedElementId === column.id

  return (
    <td
      ref={setNodeRef}
      width={`${column.width}%`}
      valign={verticalAlign}
      className={`relative border-2 ${
        isSelected ? "border-primary" : "border-transparent hover:border-blue-400"
      } ${isOver ? "bg-accent" : ""} transition-colors group/column`}
      style={{
        backgroundColor: column.backgroundColor,
        padding: `${column.padding.top}px ${column.padding.right}px ${column.padding.bottom}px ${column.padding.left}px`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(column.id)
      }}
    >
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-t z-10 font-medium">
          Column
        </div>
      )}

      <div className="absolute -top-8 left-0 opacity-0 group-hover/column:opacity-100 transition-opacity flex gap-1 z-[15]">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 cursor-grab bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
          title="Move column"
        >
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
          onClick={(e) => {
            e.stopPropagation()
            duplicateColumn(sectionId, column.id)
          }}
          title="Duplicate column"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
          onClick={(e) => {
            e.stopPropagation()
            removeColumn(sectionId, column.id)
          }}
          title="Delete column"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {column.content.length === 0 ? (
        <div className="min-h-[100px] flex items-center justify-center text-muted-foreground text-sm">
          Drop content here
        </div>
      ) : (
        <SortableContext items={column.content.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.content.map((content, index) => (
            <ContentRenderer
              key={content.id}
              content={content}
              sectionId={sectionId}
              columnId={column.id}
              index={index}
              verticalAlign={verticalAlign}
            />
          ))}
        </SortableContext>
      )}
    </td>
  )
}
