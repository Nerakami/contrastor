"use client"

import type React from "react"

import type { EmailBlock, RowBlock, ColumnBlock, ContentBlock } from "./block-types"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, GripVertical } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface BlockRendererProps {
  block: EmailBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  onDeleteContentFromColumn?: (columnId: string, contentId: string) => void
  onEditContentInColumn?: (columnId: string, contentId: string) => void
}

function DraggableContentBlock({
  contentBlock,
  columnId,
  index,
  onEdit,
  onDelete,
  renderContent,
}: {
  contentBlock: ContentBlock
  columnId: string
  index: number
  onEdit: () => void
  onDelete: () => void
  renderContent: () => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: contentBlock.id,
    data: {
      source: "column",
      columnId,
      index,
      contentId: contentBlock.id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="group">
      <td className="relative">
        <div className="relative group/content">
          <div
            {...attributes}
            {...listeners}
            className="absolute left-1 top-1 opacity-0 group-hover/content:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
          >
            <div className="bg-white border rounded p-0.5 shadow-sm">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {renderContent()}

          {/* Content block controls */}
          <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover/content:opacity-100 transition-opacity bg-white rounded shadow-sm p-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </td>
    </tr>
  )
}

function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}`,
    data: {
      source: "column",
      columnId,
      index: 0,
    },
  })

  return (
    <tr ref={setNodeRef}>
      <td
        className={`transition-colors ${isOver ? "bg-blue-50" : ""}`}
        style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px] flex flex-col items-center justify-center">
          {children}
        </div>
      </td>
    </tr>
  )
}

export function BlockRenderer({
  block,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onDeleteContentFromColumn,
  onEditContentInColumn,
}: BlockRendererProps) {
  const renderContentBlock = (contentBlock: ContentBlock, inColumn = false) => {
    const Element = inColumn ? "div" : "td"

    switch (contentBlock.type) {
      case "text":
        return (
          <Element
            style={{
              fontSize: `${contentBlock.style.fontSize}px`,
              fontWeight: contentBlock.style.fontWeight,
              textAlign: contentBlock.style.textAlign,
              color: contentBlock.style.color,
              backgroundColor:
                contentBlock.style.backgroundColor === "transparent" ? undefined : contentBlock.style.backgroundColor,
              padding: `${contentBlock.style.padding}px`,
              lineHeight: contentBlock.style.lineHeight,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: contentBlock.content }} />
          </Element>
        )

      case "image":
        return (
          <Element
            style={{
              textAlign: contentBlock.style.textAlign,
              padding: `${contentBlock.style.padding}px`,
            }}
          >
            {contentBlock.href ? (
              <a href={contentBlock.href}>
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
              </a>
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
          </Element>
        )

      case "button":
        return (
          <Element
            style={{
              textAlign: contentBlock.style.textAlign,
              padding: `${contentBlock.style.padding}px`,
            }}
          >
            {inColumn ? (
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: contentBlock.style.backgroundColor,
                  borderRadius: `${contentBlock.style.borderRadius}px`,
                }}
              >
                <a
                  href={contentBlock.href}
                  style={{
                    display: "block",
                    color: contentBlock.style.color,
                    padding: `${contentBlock.style.padding}px 24px`,
                    textDecoration: "none",
                    fontSize: `${contentBlock.style.fontSize}px`,
                    fontWeight: contentBlock.style.fontWeight,
                  }}
                >
                  {contentBlock.text}
                </a>
              </div>
            ) : (
              <table cellPadding="0" cellSpacing="0" border={0}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        backgroundColor: contentBlock.style.backgroundColor,
                        borderRadius: `${contentBlock.style.borderRadius}px`,
                      }}
                    >
                      <a
                        href={contentBlock.href}
                        style={{
                          display: "block",
                          color: contentBlock.style.color,
                          padding: `${contentBlock.style.padding}px 24px`,
                          textDecoration: "none",
                          fontSize: `${contentBlock.style.fontSize}px`,
                          fontWeight: contentBlock.style.fontWeight,
                        }}
                      >
                        {contentBlock.text}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </Element>
        )

      case "spacer":
        return (
          <Element
            style={{ height: `${contentBlock.height}px`, lineHeight: `${contentBlock.height}px`, fontSize: "1px" }}
          >
            &nbsp;
          </Element>
        )

      case "divider":
        return (
          <Element style={{ padding: `${contentBlock.style.padding}px` }}>
            {inColumn ? (
              <hr
                style={{
                  border: "none",
                  borderTop: `${contentBlock.style.thickness}px solid ${contentBlock.style.color}`,
                  margin: 0,
                }}
              />
            ) : (
              <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                <tbody>
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
                </tbody>
              </table>
            )}
          </Element>
        )

      default:
        return <Element>Unknown block type</Element>
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
              <DroppableColumn columnId={column.id}>
                <span className="text-sm">Drop content here</span>
              </DroppableColumn>
            ) : (
              <SortableContext items={column.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {column.blocks.map((contentBlock, index) => (
                  <DraggableContentBlock
                    key={contentBlock.id}
                    contentBlock={contentBlock}
                    columnId={column.id}
                    index={index}
                    onEdit={() => onEditContentInColumn?.(column.id, contentBlock.id)}
                    onDelete={() => onDeleteContentFromColumn?.(column.id, contentBlock.id)}
                    renderContent={() => renderContentBlock(contentBlock, true)}
                  />
                ))}
              </SortableContext>
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
      className={`relative group cursor-pointer border-2 transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/30"
      }`}
      onClick={onSelect}
    >
      {renderBlock()}

      {/* Block controls */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-lg p-1">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
