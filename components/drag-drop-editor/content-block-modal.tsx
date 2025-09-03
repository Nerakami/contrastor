"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContentBlock } from "./block-types"
import {
  createTextBlock,
  createImageBlock,
  createButtonBlock,
  createSpacerBlock,
  createDividerBlock,
} from "./block-types"

interface ContentBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (block: ContentBlock) => void
}

export function ContentBlockModal({ isOpen, onClose, onAdd }: ContentBlockModalProps) {
  const [blockType, setBlockType] = useState<string>("text")
  const [textContent, setTextContent] = useState("Sample text content")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [buttonText, setButtonText] = useState("Click me")
  const [buttonUrl, setButtonUrl] = useState("")
  const [spacerHeight, setSpacerHeight] = useState("20")

  const handleAdd = () => {
    let block: ContentBlock

    switch (blockType) {
      case "text":
        block = { ...createTextBlock(), content: textContent }
        break
      case "image":
        block = { ...createImageBlock(), src: imageUrl, alt: imageAlt }
        break
      case "button":
        block = { ...createButtonBlock(), text: buttonText, href: buttonUrl }
        break
      case "spacer":
        block = { ...createSpacerBlock(), height: parseInt(spacerHeight) || 20 }
        break
      case "divider":
        block = createDividerBlock()
        break
      default:
        block = createTextBlock()
    }

    onAdd(block)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setBlockType("text")
    setTextContent("Sample text content")
    setImageUrl("")
    setImageAlt("")
    setButtonText("Click me")
    setButtonUrl("")
    setSpacerHeight("20")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Content Block</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="blockType">Block Type</Label>
            <Select value={blockType} onValueChange={setBlockType}>
              <SelectTrigger>
                <SelectValue placeholder="Select block type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="spacer">Spacer</SelectItem>
                <SelectItem value="divider">Divider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {blockType === "text" && (
            <div>
              <Label htmlFor="textContent">Text Content</Label>
              <Textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text content"
              />
            </div>
          )}

          {blockType === "image" && (
            <>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </>
          )}

          {blockType === "button" && (
            <>
              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Click me"
                />
              </div>
              <div>
                <Label htmlFor="buttonUrl">Button URL</Label>
                <Input
                  id="buttonUrl"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          {blockType === "spacer" && (
            <div>
              <Label htmlFor="spacerHeight">Height (px)</Label>
              <Input
                id="spacerHeight"
                value={spacerHeight}
                onChange={(e) => setSpacerHeight(e.target.value)}
                placeholder="20"
                type="number"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Block</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
