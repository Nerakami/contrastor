"use client"

import { useDroppable } from "@dnd-kit/core"

interface CanvasDropZoneProps {
  children: React.ReactNode
}

export function CanvasDropZone({ children }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "main-canvas",
    data: { isCanvas: true },
  })
  
  // console.log("Canvas drop zone - isOver:", isOver)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 border rounded-lg p-4 transition-colors ${
        isOver ? "bg-primary/5 border-primary" : "bg-white"
      }`}
    >
      {children}
    </div>
  )
}
