"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link2, Unlink } from "lucide-react"
import { useState } from "react"

interface PaddingValue {
  top: number
  right: number
  bottom: number
  left: number
}

interface PaddingControlsProps {
  value: PaddingValue | number
  onChange: (value: PaddingValue) => void
}

export function PaddingControls({ value, onChange }: PaddingControlsProps) {
  const [isLinked, setIsLinked] = useState(typeof value === "number")
  
  const paddingValue: PaddingValue = typeof value === "number" 
    ? { top: value, right: value, bottom: value, left: value }
    : value

  const handleChange = (side: keyof PaddingValue, newValue: number) => {
    if (isLinked) {
      onChange({ top: newValue, right: newValue, bottom: newValue, left: newValue })
    } else {
      onChange({ ...paddingValue, [side]: newValue })
    }
  }

  const toggleLinked = () => {
    const newLinked = !isLinked
    setIsLinked(newLinked)
    if (newLinked) {
      // When linking, use the top value for all sides
      const uniform = paddingValue.top
      onChange({ top: uniform, right: uniform, bottom: uniform, left: uniform })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Padding</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleLinked}
          className="h-6 w-6 p-0"
        >
          {isLinked ? <Link2 className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
        </Button>
      </div>

      {isLinked ? (
        <div>
          <Input
            type="number"
            value={paddingValue.top}
            onChange={(e) => handleChange('top', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="text-center"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <div>
            <Input
              type="number"
              value={paddingValue.top}
              onChange={(e) => handleChange('top', parseInt(e.target.value) || 0)}
              placeholder="Top"
              className="text-center text-xs"
            />
          </div>
          <div></div>
          
          <div>
            <Input
              type="number"
              value={paddingValue.left}
              onChange={(e) => handleChange('left', parseInt(e.target.value) || 0)}
              placeholder="Left"
              className="text-center text-xs"
            />
          </div>
          <div></div>
          <div>
            <Input
              type="number"
              value={paddingValue.right}
              onChange={(e) => handleChange('right', parseInt(e.target.value) || 0)}
              placeholder="Right"
              className="text-center text-xs"
            />
          </div>
          
          <div></div>
          <div>
            <Input
              type="number"
              value={paddingValue.bottom}
              onChange={(e) => handleChange('bottom', parseInt(e.target.value) || 0)}
              placeholder="Bottom"
              className="text-center text-xs"
            />
          </div>
          <div></div>
        </div>
      )}
    </div>
  )
}
