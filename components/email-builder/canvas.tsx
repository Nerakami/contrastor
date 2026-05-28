"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEmailBuilderStore } from "@/lib/email-builder/store"
import { SectionRenderer } from "./section-renderer"
import { DropIndicator } from "./drop-indicator"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CanvasProps {
  activeId?: string | null
}

export function Canvas({ activeId }: CanvasProps) {
  const { sections, canvasWidth, canvasBackgroundColor } = useEmailBuilderStore()
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: { type: "canvas" },
  })

  const isDraggingStructure = activeId?.startsWith("section-")

  return (
    <Card className="flex-1 h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Email Canvas</h2>
        <div className="text-sm text-muted-foreground">{canvasWidth}px</div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 flex justify-center">
          <div
            ref={setNodeRef}
            style={{
              width: canvasWidth,
              backgroundColor: canvasBackgroundColor,
            }}
            className={`min-h-[600px] bg-white border-2 ${
              isOver ? "border-primary" : "border-border"
            } transition-colors`}
          >
            {sections.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Start building your email</p>
                  <p className="text-sm">Drag structure blocks from the left sidebar</p>
                </div>
              </div>
            ) : (
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <DropIndicator id="drop-before-0" index={0} isActive={!!isDraggingStructure} />

                {sections.map((section, index) => (
                  <div key={section.id}>
                    <SectionRenderer section={section} index={index} />
                    <DropIndicator id={`drop-after-${index}`} index={index + 1} isActive={!!isDraggingStructure} />
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
        </div>
      </ScrollArea>
    </Card>
  )
}
