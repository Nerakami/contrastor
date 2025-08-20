"use client"

import type { EmailBlock, RowBlock, ColumnBlock, ContentBlock } from "./block-types"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Plus } from "lucide-react"

interface BlockRendererProps {
  block: EmailBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  onAddToColumn?: (columnId: string) => void
}

export function BlockRenderer({ block, isSelected, onSelect, onDelete, onEdit, onAddToColumn }: BlockRendererProps) {
  const renderContentBlock = (contentBlock: ContentBlock, inColumn = false) => {
    switch (contentBlock.type) {
      case "text":
        return (
          <td
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
          </td>
        )

      case "image":
        return (
          <td
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
          </td>
        )

      case "button":
        return (
          <td
            style={{
              textAlign: contentBlock.style.textAlign,
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
                <td style={{ padding: "20px", textAlign: "center", color: "#9ca3af", border: "2px dashed #e5e7eb" }}>
                  <div className="flex flex-col items-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Drop content here</span>
                    {onAddToColumn && (
                      <Button size="sm" variant="outline" onClick={() => onAddToColumn(column.id)}>
                        Add Content
                      </Button>
                    )}
                  </div>
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
