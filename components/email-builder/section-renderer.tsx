"use client"

import type React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEmailBuilderStore, type Section } from "@/lib/email-builder/store"
import { ColumnRenderer } from "./column-renderer"
import { GripVertical, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SectionRendererProps {
  section: Section
  index: number
}

export function SectionRenderer({ section, index }: SectionRendererProps) {
  const { removeSection, selectElement, selectedElementId, duplicateSection } = useEmailBuilderStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { type: "section", index },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isSelected = selectedElementId === section.id

  const totalColumnWidth = section.columns.reduce((sum, col) => sum + col.width, 0)
  const hasWidthError = Math.abs(totalColumnWidth - 100) > 0.1

  const backgroundStyle: React.CSSProperties = {
    padding: `${section.padding.top}px ${section.padding.right}px ${section.padding.bottom}px ${section.padding.left}px`,
  }

  if (section.backgroundType === "image" && section.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${section.backgroundImage})`
    backgroundStyle.backgroundPosition = section.backgroundPosition || "center center"
    backgroundStyle.backgroundRepeat = section.backgroundRepeat || "no-repeat"

    if (section.backgroundSize === "custom") {
      backgroundStyle.backgroundSize = `${section.backgroundSizeWidth || "100%"} ${section.backgroundSizeHeight || "auto"}`
    } else {
      backgroundStyle.backgroundSize = section.backgroundSize || "cover"
    }

    backgroundStyle.backgroundColor = section.backgroundColor
  } else {
    backgroundStyle.backgroundColor = section.backgroundColor
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border-2 ${
        isSelected ? "border-primary" : hasWidthError ? "border-red-500" : "border-transparent hover:border-orange-400"
      } transition-colors`}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(section.id)
      }}
    >
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-t z-10 font-medium">
          Section
        </div>
      )}

      {hasWidthError && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
          Width: {totalColumnWidth.toFixed(0)}%
        </div>
      )}

      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 cursor-grab bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
          {...attributes}
          {...listeners}
          title="Move section"
        >
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
          onClick={(e) => {
            e.stopPropagation()
            duplicateSection(section.id)
          }}
          title="Duplicate section"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
          onClick={(e) => {
            e.stopPropagation()
            removeSection(section.id)
          }}
          title="Delete section"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <table width="100%" cellPadding="0" cellSpacing="0" style={backgroundStyle}>
        <tbody>
          <tr>
            {section.columns.map((column) => (
              <ColumnRenderer
                key={column.id}
                column={column}
                sectionId={section.id}
                verticalAlign={section.verticalAlign}
              />
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
