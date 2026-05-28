"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  UnderlineIcon,
  LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  fontSize?: number
  fontFamily?: string
  color?: string
  textAlign?: "left" | "center" | "right"
}

export function RichTextEditor({
  content,
  onChange,
  fontSize = 16,
  fontFamily = "Arial, sans-serif",
  color = "#000000",
  textAlign = "left",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [currentFontSize, setCurrentFontSize] = useState(fontSize)
  const [currentColor, setCurrentColor] = useState(color)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "<p>Enter your text here...</p>"
    }
  }, [content])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    const url = window.prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor)
    execCommand("foreColor", newColor)
  }

  const handleFontSizeChange = (size: string) => {
    const sizeNum = Number.parseInt(size)
    setCurrentFontSize(sizeNum)

    // Wrap selected text in span with font-size
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = `${size}px`

      try {
        range.surroundContents(span)
        handleInput()
      } catch (e) {
        // If surroundContents fails, use execCommand as fallback
        execCommand("fontSize", "7")
        const fontElements = editorRef.current?.querySelectorAll("font[size='7']")
        fontElements?.forEach((el) => {
          const span = document.createElement("span")
          span.style.fontSize = `${size}px`
          span.innerHTML = el.innerHTML
          el.replaceWith(span)
        })
      }
    }

    editorRef.current?.focus()
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        {/* Text Formatting */}
        <Button size="sm" variant="ghost" onClick={() => execCommand("bold")} className="h-8 w-8 p-0" type="button">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => execCommand("italic")} className="h-8 w-8 p-0" type="button">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyLeft")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyCenter")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyRight")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Button size="sm" variant="ghost" onClick={insertLink} className="h-8 w-8 p-0" type="button">
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" type="button">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-10 w-20"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" type="button">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={currentFontSize.toString()} onValueChange={handleFontSizeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                  <SelectItem value="24">24px</SelectItem>
                  <SelectItem value="32">32px</SelectItem>
                  <SelectItem value="48">48px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          color,
          textAlign,
        }}
        suppressContentEditableWarning
      />
    </div>
  )
}
