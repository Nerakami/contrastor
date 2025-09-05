"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "./rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { EmailBlock } from "./block-types"

interface BlockEditorProps {
  block: EmailBlock | null
  onUpdate: (block: EmailBlock) => void
  onClose: () => void
}

export function BlockEditor({ block, onUpdate, onClose }: BlockEditorProps) {
  const [localBlock, setLocalBlock] = useState<EmailBlock | null>(block)

  useEffect(() => {
    setLocalBlock(block)
  }, [block])

  if (!localBlock) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Select a block to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  const updateBlock = (updates: Partial<EmailBlock>) => {
    const updatedBlock = { ...localBlock, ...updates } as EmailBlock
    setLocalBlock(updatedBlock)
    onUpdate(updatedBlock)
  }

  const updateStyle = (styleUpdates: any) => {
    if ("style" in localBlock) {
      updateBlock({
        style: { ...localBlock.style, ...styleUpdates },
      })
    }
  }

  const renderEditor = () => {
    switch (localBlock.type) {
      case "text":
        return (
          <div className="space-y-4">
            <RichTextEditor
              value={localBlock.content}
              onChange={(content) => updateBlock({ content })}
              fontFamily={localBlock.style.fontFamily}
              onFontFamilyChange={(fontFamily) => updateStyle({ fontFamily })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[localBlock.style.fontSize]}
                    onValueChange={([value]) => updateStyle({ fontSize: value })}
                    min={12}
                    max={48}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{localBlock.style.fontSize}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select
                  value={localBlock.style.fontWeight}
                  onValueChange={(value) => updateStyle({ fontWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textAlign">Text Align</Label>
                <Select value={localBlock.style.textAlign} onValueChange={(value) => updateStyle({ textAlign: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Text Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={localBlock.style.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backgroundColor">Background</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={
                    localBlock.style.backgroundColor === "transparent" ? "#ffffff" : localBlock.style.backgroundColor
                  }
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="padding">Padding</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16]}
                    onValueChange={([value]) => updateStyle({ padding: value })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageFile">Upload Image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      updateBlock({ src: e.target?.result as string })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="src">Or enter Image URL</Label>
              <Input
                id="src"
                value={localBlock.src}
                onChange={(e) => updateBlock({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="imageHref">Link URL (optional)</Label>
              <Input
                id="imageHref"
                value={localBlock.href || ""}
                onChange={(e) => updateBlock({ href: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={localBlock.alt}
                onChange={(e) => updateBlock({ alt: e.target.value })}
                placeholder="Describe the image"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={localBlock.style.width}
                  onChange={(e) => updateStyle({ width: e.target.value })}
                  placeholder="100% or 400px"
                />
              </div>

              <div>
                <Label htmlFor="textAlign">Alignment</Label>
                <Select value={localBlock.style.textAlign} onValueChange={(value) => updateStyle({ textAlign: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="padding">Padding</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16]}
                  onValueChange={([value]) => updateStyle({ padding: value })}
                  min={0}
                  max={64}
                  step={4}
                  className="flex-1"
                />
                <span className="text-sm w-8">{typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16}</span>
              </div>
            </div>
          </div>
        )

      case "button":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Button Text</Label>
              <Input id="text" value={localBlock.text} onChange={(e) => updateBlock({ text: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={localBlock.href}
                onChange={(e) => updateBlock({ href: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backgroundColor">Background</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={localBlock.style.backgroundColor}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="color">Text Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={localBlock.style.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[localBlock.style.fontSize]}
                    onValueChange={([value]) => updateStyle({ fontSize: value })}
                    min={12}
                    max={24}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{localBlock.style.fontSize}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="borderRadius">Border Radius</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[localBlock.style.borderRadius]}
                    onValueChange={([value]) => updateStyle({ borderRadius: value })}
                    min={0}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-8">{localBlock.style.borderRadius}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="textAlign">Alignment</Label>
              <Select value={localBlock.style.textAlign} onValueChange={(value) => updateStyle({ textAlign: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "spacer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[localBlock.height]}
                  onValueChange={([value]) => updateBlock({ height: value })}
                  min={8}
                  max={128}
                  step={8}
                  className="flex-1"
                />
                <span className="text-sm w-12">{localBlock.height}px</span>
              </div>
            </div>
          </div>
        )

      case "divider":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={localBlock.style.color}
                onChange={(e) => updateStyle({ color: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="thickness">Thickness</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[localBlock.style.thickness]}
                  onValueChange={([value]) => updateStyle({ thickness: value })}
                  min={1}
                  max={8}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{localBlock.style.thickness}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="padding">Padding</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16]}
                  onValueChange={([value]) => updateStyle({ padding: value })}
                  min={0}
                  max={64}
                  step={4}
                  className="flex-1"
                />
                <span className="text-sm w-8">{typeof localBlock.style.padding === 'number' ? localBlock.style.padding : 16}</span>
              </div>
            </div>
          </div>
        )

      default:
        return <div>No editor available for this block type</div>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg capitalize">{localBlock.type} Block</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </CardHeader>
      <CardContent>{renderEditor()}</CardContent>
    </Card>
  )
}
