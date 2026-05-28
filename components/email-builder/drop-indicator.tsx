"use client"

import { useDroppable } from "@dnd-kit/core"

interface DropIndicatorProps {
  id: string
  index: number
  isActive: boolean
}

export function DropIndicator({ id, index, isActive }: DropIndicatorProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "drop-zone", index },
  })

  if (!isActive) return null

  return (
    <div
      ref={setNodeRef}
      className={`h-12 flex items-center justify-center transition-all ${isOver ? "bg-primary/10" : "bg-transparent"}`}
    >
      <div className={`h-1 w-full transition-all ${isOver ? "bg-primary scale-y-150" : "bg-border"}`} />
    </div>
  )
}
