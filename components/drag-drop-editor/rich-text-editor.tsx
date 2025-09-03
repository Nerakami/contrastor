"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bold, Italic, Underline, Link } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  fontFamily?: string
  onFontFamilyChange?: (fontFamily: string) => void
}

export function RichTextEditor({ value, onChange, fontFamily = "Arial", onFontFamilyChange }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Courier New", label: "Courier New" },
  ]

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand(command, false, value)
      updateContent()
    }
  }

  const updateContent = useCallback(() => {
    if (editorRef.current && isInitialized) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange, isInitialized])
  
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0)
    }
    return null
  }

  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const handleLinkInsert = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setLinkText(selection.toString())
    }
    setIsLinkModalOpen(true)
  }

  const insertLink = () => {
    if (linkText && linkUrl) {
      const linkHTML = `<a href="${linkUrl}" style="color: #0066cc; text-decoration: underline;">${linkText}</a>`
      execCommand('insertHTML', linkHTML)
    }
    setIsLinkModalOpen(false)
    setLinkUrl("")
    setLinkText("")
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Font Family</Label>
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Content</Label>
        <div className="border rounded-md">
          {/* Toolbar */}
          <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
            <Button
              size="sm"
              variant="ghost"
              onMouseDown={(e) => {
                e.preventDefault()
                execCommand('bold')
              }}
              className="h-8 px-2"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onMouseDown={(e) => {
                e.preventDefault()
                execCommand('italic')
              }}
              className="h-8 px-2"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onMouseDown={(e) => {
                e.preventDefault()
                execCommand('underline')
              }}
              className="h-8 px-2"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onMouseDown={(e) => {
                e.preventDefault()
                handleLinkInsert()
              }}
              className="h-8 px-2"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="p-3 min-h-[100px] focus:outline-none"
            style={{ fontFamily }}
            onInput={updateContent}
            onBlur={updateContent}
            suppressContentEditableWarning={true}
          />
        </div>
      </div>

      {/* Link Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={insertLink}>Insert Link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
