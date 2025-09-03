"use client"

import type { EmailBlock, RowBlock, ColumnBlock, ContentBlock } from "./block-types"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Plus, GripVertical } from "lucide-react"
import { useSortable, useDroppable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ColumnDropZone } from "./column-drop-zone"

interface BlockRendererProps {
  block: EmailBlock
  isSelected: boolean
  selectedBlockId?: string | null
  onSelect: (blockId?: string) => void
  onDelete: (blockId?: string) => void
  onEdit: (blockId?: string) => void
  onAddToColumn?: (columnId: string, contentBlock: ContentBlock) => void
}

export function BlockRenderer({ block, isSelected, selectedBlockId, onSelect, onDelete, onEdit, onAddToColumn }: BlockRendererProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { block },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const renderContentBlock = (contentBlock: ContentBlock, inColumn = false) => {
    const isContentSelected = selectedBlockId === contentBlock.id
    
    switch (contentBlock.type) {
      case "text":
        return (
          <td
            className={`relative cursor-pointer transition-colors ${
              isContentSelected ? "ring-2 ring-primary ring-offset-2" : "hover:bg-gray-50"
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(contentBlock.id)
            }}
            align={contentBlock.style.textAlign}
            style={{
              fontSize: `${contentBlock.style.fontSize}px`,
              fontWeight: contentBlock.style.fontWeight,
              fontFamily: contentBlock.style.fontFamily,
              color: contentBlock.style.color,
              backgroundColor:
                contentBlock.style.backgroundColor === "transparent" ? undefined : contentBlock.style.backgroundColor,
              padding: `${contentBlock.style.padding}px`,
              lineHeight: contentBlock.style.lineHeight,
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: contentBlock.content }} 
              onClick={(e) => {
                // Prevent links from being clickable in editor
                const target = e.target as HTMLElement
                if (target.tagName === 'A' || target.closest('a')) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            />
            {isContentSelected && (
              <div className="absolute top-1 right-1 flex space-x-1 bg-white rounded shadow-sm border p-1">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(contentBlock.id) }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(contentBlock.id) }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </td>
        )

      case "image":
        return (
          <td
            align={contentBlock.style.textAlign}
            style={{
              padding: `${contentBlock.style.padding}px`,
            }}
          >
            {contentBlock.href ? (
              <span 
                style={{ cursor: "default" }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              >
                <img
                  src={contentBlock.src || "/placeholder.svg"}
                  alt={contentBlock.alt}
                  style={{
                    width: contentBlock.style.width,
                    height: contentBlock.style.height,
                    maxWidth: "100%",
                    display: "block",
                  }}
                />
              </span>
            ) : (
              <img
                src={contentBlock.src || "/placeholder.svg"}
                alt={contentBlock.alt}
                style={{
                  width: contentBlock.style.width,
                  height: contentBlock.style.height,
                  maxWidth: "100%",
                  display: "block",
                }}
              />
            )}
          </td>
        )

      case "button":
        return (
          <td
            align={contentBlock.style.textAlign}
            style={{
              padding: `${contentBlock.style.padding}px`,
            }}
          >
            <table cellPadding="0" cellSpacing="0" border={0}>
              <tr>
                <td
                  style={{
                    backgroundColor: contentBlock.style.backgroundColor,
                    borderRadius: `${contentBlock.style.borderRadius}px`,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: contentBlock.style.color,
                      padding: `${contentBlock.style.padding}px 24px`,
                      textDecoration: "none",
                      fontSize: `${contentBlock.style.fontSize}px`,
                      fontWeight: contentBlock.style.fontWeight,
                      cursor: "default",
                    }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                  >
                    {contentBlock.text}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        )

      case "spacer":
        return (
          <td style={{ height: `${contentBlock.height}px`, lineHeight: `${contentBlock.height}px`, fontSize: "1px" }}>
            &nbsp;
          </td>
        )

      case "divider":
        return (
          <td style={{ padding: `${contentBlock.style.padding}px` }}>
            <table cellPadding="0" cellSpacing="0" border={0} width="100%">
              <tr>
                <td
                  style={{
                    borderTop: `${contentBlock.style.thickness}px solid ${contentBlock.style.color}`,
                    fontSize: "1px",
                    lineHeight: "1px",
                  }}
                >
                  &nbsp;
                </td>
              </tr>
            </table>
          </td>
        )

      default:
        return <td>Unknown block type</td>
    }
  }

  const renderColumn = (column: ColumnBlock) => {
    return (
      <td
        key={column.id}
        width={`${column.width}%`}
        style={{
          backgroundColor: column.style.backgroundColor === "transparent" ? undefined : column.style.backgroundColor,
          padding: `${column.style.padding}px`,
          verticalAlign: column.style.verticalAlign,
        }}
      >
        <table cellPadding="0" cellSpacing="0" border={0} width="100%">
          <tbody>
            {column.blocks.length === 0 ? (
              <tr>
                <td style={{ padding: "10px" }}>
                  {onAddToColumn && (
                    <ColumnDropZone
                      columnId={column.id}
                      onAddContent={(contentBlock) => onAddToColumn(column.id, contentBlock)}
                    />
                  )}
                </td>
              </tr>
            ) : (
              column.blocks.map((contentBlock) => (
                <tr key={contentBlock.id}>{renderContentBlock(contentBlock, true)}</tr>
              ))
            )}
          </tbody>
        </table>
      </td>
    )
  }

  const renderBlock = () => {
    if (block.type === "row") {
      const rowBlock = block as RowBlock
      return (
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          width="100%"
          style={{
            backgroundColor:
              rowBlock.style.backgroundColor === "transparent" ? undefined : rowBlock.style.backgroundColor,
          }}
        >
          <tbody>
            <tr>{rowBlock.columns.map(renderColumn)}</tr>
          </tbody>
        </table>
      )
    } else {
      // Standalone content block (wrap in table structure)
      return (
        <table cellPadding="0" cellSpacing="0" border={0} width="100%">
          <tbody>
            <tr>{renderContentBlock(block as ContentBlock)}</tr>
          </tbody>
        </table>
      )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/30"
      }`}
      onClick={() => onSelect(block.id)}
    >
      {renderBlock()}

      {/* Block controls */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-lg p-1">
          <Button 
            size="sm" 
            variant="ghost" 
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(block.id)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(block.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
