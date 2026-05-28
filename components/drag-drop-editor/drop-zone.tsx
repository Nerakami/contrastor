"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"

interface DropZoneProps {
  onDrop: (data: any) => void
  className?: string
  children?: React.ReactNode
  showDropIndicator?: boolean
}

export function DropZone({ onDrop, className = "", children, showDropIndicator = true }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    try {
      const dragData = e.dataTransfer.getData("text/plain")

      if (!dragData) {
        console.warn("No drag data found")
        return
      }

      const data = JSON.parse(dragData)
      onDrop(data)
    } catch (error) {
      console.error("Failed to parse drop data:", error)
    }
  }

  return (
    <div
      className={`
        ${className}
        ${isDragOver ? "bg-primary/10 border-primary border-2 border-dashed" : ""}
        ${showDropIndicator && !children ? "border-2 border-dashed border-muted-foreground/30 bg-muted/20" : ""}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children || (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Plus className="h-8 w-8 mb-2" />
          <p className="text-sm">Drop blocks here</p>
        </div>
      )}
    </div>
  )
}
