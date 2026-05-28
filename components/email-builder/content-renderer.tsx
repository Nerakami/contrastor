"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEmailBuilderStore, type ContentElement } from "@/lib/email-builder/store"
import { GripVertical, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentRendererProps {
  content: ContentElement
  sectionId: string
  columnId: string
  index: number
  verticalAlign?: "top" | "middle" | "bottom"
}

export function ContentRenderer({ content, sectionId, columnId, index, verticalAlign = "top" }: ContentRendererProps) {
  const { removeContent, selectElement, selectedElementId, updateElement, duplicateContent } = useEmailBuilderStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: content.id,
    data: { type: "content", sectionId, columnId, index },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isSelected = selectedElementId === content.id

  const renderContent = () => {
    switch (content.type) {
      case "text":
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: content.fontSize,
                    fontFamily: content.fontFamily,
                    color: content.color,
                    lineHeight: content.lineHeight,
                    padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
                    verticalAlign,
                  }}
                  align={content.textAlign}
                  dangerouslySetInnerHTML={{ __html: content.content }}
                  onClick={(e) => {
                    // Prevent link clicks in the canvas
                    const target = e.target as HTMLElement
                    if (target.tagName === "A") {
                      e.preventDefault()
                    }
                    e.stopPropagation()
                    selectElement(content.id)
                  }}
                />
              </tr>
            </tbody>
          </table>
        )

      case "image":
        const imageElement = (
          <img
            src={content.src || "/placeholder.svg"}
            alt={content.alt}
            style={{
              width: content.widthUnit === "px" ? `${content.width}px` : `${content.width}%`,
              maxWidth: "100%",
              display: "block",
            }}
          />
        )

        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
                    verticalAlign,
                  }}
                  align={content.align}
                >
                  {content.link ? (
                    <a
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.preventDefault()}
                      style={{ display: "block" }}
                    >
                      {imageElement}
                    </a>
                  ) : (
                    imageElement
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )

      case "button":
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
                    verticalAlign,
                  }}
                  align={content.align}
                >
                  <a
                    href={content.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      color: content.color,
                      backgroundColor: content.backgroundColor,
                      borderRadius: content.borderRadius,
                      padding: `${content.buttonPadding.top}px ${content.buttonPadding.right}px ${content.buttonPadding.bottom}px ${content.buttonPadding.left}px`,
                      textDecoration: "none",
                      fontSize: `${content.fontSize}px`,
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    {content.text}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        )

      case "divider":
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td
                  style={{
                    padding: `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`,
                    verticalAlign,
                  }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      <tr>
                        <td
                          style={{
                            borderTop: `${content.height}px solid ${content.color}`,
                            fontSize: 0,
                            lineHeight: 0,
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        )

      case "spacer":
        return (
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ height: `${content.height}px`, fontSize: 0, lineHeight: 0 }}>&nbsp;</td>
              </tr>
            </tbody>
          </table>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/content relative border-2 ${
        isSelected ? "border-primary" : "border-transparent hover:border-green-400 hover:bg-green-50/50"
      } transition-colors`}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(content.id)
      }}
    >
      <div className="absolute -top-8 right-0 opacity-0 group-hover/content:opacity-100 transition-opacity flex gap-1 z-[5]">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 cursor-grab bg-green-500 text-white hover:bg-green-600 border-green-500"
          {...attributes}
          {...listeners}
          title="Move content"
        >
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-green-500 text-white hover:bg-green-600 border-green-500"
          onClick={(e) => {
            e.stopPropagation()
            duplicateContent(sectionId, columnId, content.id)
          }}
          title="Duplicate content"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6 bg-green-500 text-white hover:bg-green-600 border-green-500"
          onClick={(e) => {
            e.stopPropagation()
            removeContent(sectionId, columnId, content.id)
          }}
          title="Delete content"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {renderContent()}
    </div>
  )
}
