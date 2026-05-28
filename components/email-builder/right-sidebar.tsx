"use client"

import { useEmailBuilderStore } from "@/lib/email-builder/store"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Bold, Italic, Underline, LinkIcon, Palette, X, Plus, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function RightSidebar() {
  const {
    sections,
    selectedElementId,
    updateElement,
    selectElement,
    canvasWidth,
    canvasBackgroundColor,
    setCanvasWidth,
    setCanvasBackgroundColor,
    addColumnToSection,
  } = useEmailBuilderStore()
  const [selectedElement, setSelectedElement] = useState<any | null>(null)
  const [elementType, setElementType] = useState<string | null>(null)
  const [hasWidthError, setHasWidthError] = useState<boolean>(false)
  const [totalColumnWidth, setTotalColumnWidth] = useState<number>(0)
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [sourceHTML, setSourceHTML] = useState("")

  useEffect(() => {
    if (!selectedElementId) {
      setSelectedElement(null)
      setElementType(null)
      return
    }

    // Check if it's a section
    const section = sections.find((s) => s.id === selectedElementId)
    if (section) {
      setSelectedElement(section)
      setElementType("section")
      return
    }

    // Check if it's a column
    for (const section of sections) {
      const column = section.columns.find((c) => c.id === selectedElementId)
      if (column) {
        setSelectedElement(column)
        setElementType("column")
        return
      }
    }

    // Check if it's a content element
    for (const section of sections) {
      for (const column of section.columns) {
        const content = column.content.find((c) => c.id === selectedElementId)
        if (content) {
          setSelectedElement(content)
          setElementType(content.type)
          return
        }
      }
    }

    // If not found, clear selection
    setSelectedElement(null)
    setElementType(null)
  }, [selectedElementId, sections])

  const contentEditableRef = useRef<HTMLDivElement>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [textColor, setTextColor] = useState("#000000")

  useEffect(() => {
    if (selectedElement && elementType === "column" && selectedElement.parent) {
      const totalWidth = selectedElement.parent.columns.reduce((acc, col) => acc + col.width, 0)
      setTotalColumnWidth(totalWidth)
      setHasWidthError(totalWidth !== 100)
    }
  }, [selectedElement])

  const insertHtmlTag = (tag: string, closingTag?: string) => {
    const div = contentEditableRef.current
    if (!div || !selectedElement) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Create the HTML element
    const element = document.createElement(tag)
    element.textContent = selectedText || "text"

    // Replace the selection with the new element
    range.deleteContents()
    range.insertNode(element)

    // Update the store with the new HTML
    updateElement(selectedElementId!, { content: div.innerHTML })

    // Move cursor after the inserted element
    range.setStartAfter(element)
    range.setEndAfter(element)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const insertLink = () => {
    const div = contentEditableRef.current
    if (!div || !selectedElement || !linkUrl) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Create the link element
    const link = document.createElement("a")
    link.href = linkUrl
    link.style.color = "inherit"
    link.style.textDecoration = "underline"
    link.textContent = selectedText || "Link text"

    // Replace the selection with the link
    range.deleteContents()
    range.insertNode(link)

    // Update the store
    updateElement(selectedElementId!, { content: div.innerHTML })
    setLinkUrl("")

    // Move cursor after the link
    range.setStartAfter(link)
    range.setEndAfter(link)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const insertColorSpan = () => {
    const div = contentEditableRef.current
    if (!div || !selectedElement) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Create the span element
    const span = document.createElement("span")
    span.style.color = textColor
    span.textContent = selectedText || "text"

    // Replace the selection with the span
    range.deleteContents()
    range.insertNode(span)

    // Update the store
    updateElement(selectedElementId!, { content: div.innerHTML })

    // Move cursor after the span
    range.setStartAfter(span)
    range.setEndAfter(span)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  useEffect(() => {
    if (contentEditableRef.current && selectedElement && elementType === "text") {
      // Only update if content has changed to avoid cursor jumping
      if (contentEditableRef.current.innerHTML !== selectedElement.content) {
        contentEditableRef.current.innerHTML = selectedElement.content
      }
    }
  }, [selectedElement])

  const generateElementHTML = () => {
    if (!selectedElement || !elementType) return ""

    const canvasWidth = useEmailBuilderStore.getState().canvasWidth

    if (elementType === "section") {
      const section = selectedElement
      const sectionIndex = sections.findIndex((s) => s.id === section.id)

      const sectionClasses = [
        section.mobileColumnBehavior === "stack" ? `mobile-stack-${sectionIndex}` : "",
        section.hideOnMobile ? "hide-on-mobile" : "",
        section.hideOnDesktop ? "hide-on-desktop" : "",
      ]
        .filter(Boolean)
        .join(" ")

      const hasBackgroundImage = section.backgroundType === "image" && section.backgroundImage
      let backgroundSize = section.backgroundSize || "cover"
      if (section.backgroundSize === "custom") {
        backgroundSize = `${section.backgroundSizeWidth || "100%"} ${section.backgroundSizeHeight || "auto"}`
      }

      let html = `<table width="100%" cellpadding="0" cellspacing="0" class="${sectionClasses}" style="background-color: ${section.backgroundColor};">
  <tbody>
    <tr>
      <td style="padding: ${section.padding.top}px ${section.padding.right}px ${section.padding.bottom}px ${section.padding.left}px;${hasBackgroundImage ? ` background-image: url(${section.backgroundImage}); background-size: ${backgroundSize}; background-repeat: ${section.backgroundRepeat || "no-repeat"}; background-position: ${section.backgroundPosition || "center center"};` : ""}">`

      if (hasBackgroundImage) {
        html += `
        <!--[if gte mso 9]>
        <v:image xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; width: ${canvasWidth}px; height: auto;" src="${section.backgroundImage}" />
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; position: absolute; width: ${canvasWidth}px; height: auto;">
          <v:fill opacity="0%" color="${section.backgroundColor}" />
          <v:textbox inset="0,0,0,0">
        <![endif]-->`
      }

      html += `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>`

      section.columns.forEach((column, columnIndex) => {
        const columnClasses = [
          section.mobileColumnBehavior === "stack" ? `mobile-column-${sectionIndex}-${columnIndex}` : "",
          column.hideOnMobile ? "hide-on-mobile" : "",
          column.hideOnDesktop ? "hide-on-desktop" : "",
        ]
          .filter(Boolean)
          .join(" ")

        html += `
              <td width="${column.width}%" valign="${section.verticalAlign || "top"}" class="${columnClasses}" style="background-color: ${column.backgroundColor}; padding: ${column.padding.top}px ${column.padding.right}px ${column.padding.bottom}px ${column.padding.left}px;">
                <!-- Column content here -->
              </td>`
      })

      html += `
            </tr>
          </tbody>
        </table>`

      if (hasBackgroundImage) {
        html += `
        <!--[if gte mso 9]>
          </v:textbox>
        </v:rect>
        </v:image>
        <![endif]-->`
      }

      html += `
      </td>
    </tr>
  </tbody>
</table>`

      return html
    }

    if (elementType === "column") {
      const column = selectedElement
      let sectionIndex = 0
      let section: any = null

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i]
        if (s.columns.find((c) => c.id === column.id)) {
          section = s
          sectionIndex = i
          break
        }
      }

      if (!section) return ""

      const columnIndex = section.columns.findIndex((c) => c.id === column.id)
      const columnClasses = [
        section.mobileColumnBehavior === "stack" ? `mobile-column-${sectionIndex}-${columnIndex}` : "",
        column.hideOnMobile ? "hide-on-mobile" : "",
        column.hideOnDesktop ? "hide-on-desktop" : "",
      ]
        .filter(Boolean)
        .join(" ")

      let html = `<td width="${column.width}%" valign="${section.verticalAlign || "top"}" class="${columnClasses}" style="background-color: ${column.backgroundColor}; padding: ${column.padding.top}px ${column.padding.right}px ${column.padding.bottom}px ${column.padding.left}px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tbody>`

      column.content.forEach((content) => {
        html += `
      <tr>
        <td>
          <!-- ${content.type} content -->
        </td>
      </tr>`
      })

      html += `
    </tbody>
  </table>
</td>`

      return html
    }

    // Content elements
    if (elementType === "text") {
      const content = selectedElement
      let section: any = null

      for (const s of sections) {
        for (const col of s.columns) {
          if (col.content.find((c) => c.id === content.id)) {
            section = s
            break
          }
        }
        if (section) break
      }

      return `<td style="font-size: ${content.fontSize}px; font-family: ${content.fontFamily}; color: ${content.color}; line-height: ${content.lineHeight}; padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section?.verticalAlign || "top"};" align="${content.textAlign}">
  ${content.content.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')}
</td>`
    }

    if (elementType === "image") {
      const content = selectedElement
      let section: any = null

      for (const s of sections) {
        for (const col of s.columns) {
          if (col.content.find((c) => c.id === content.id)) {
            section = s
            break
          }
        }
        if (section) break
      }

      const widthStyle = content.widthUnit === "%" ? `${content.width}%` : `${content.width}px`

      let imgTag = `<img src="${content.src || "/placeholder.svg"}" alt="${content.alt}" style="width: ${widthStyle}; max-width: 100%; height: auto; display: block;" />`

      if (content.link) {
        imgTag = `<a href="${content.link}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`
      }

      return `<td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section?.verticalAlign || "top"};" align="${content.align}">
  ${imgTag}
</td>`
    }

    if (elementType === "button") {
      const content = selectedElement
      let section: any = null

      for (const s of sections) {
        for (const col of s.columns) {
          if (col.content.find((c) => c.id === content.id)) {
            section = s
            break
          }
        }
        if (section) break
      }

      return `<td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section?.verticalAlign || "top"};" align="${content.align}">
  <a href="${content.href}" target="_blank" rel="noopener noreferrer" style="display: inline-block; color: ${content.color}; background-color: ${content.backgroundColor}; border-radius: ${content.borderRadius}px; padding: ${content.buttonPadding.top}px ${content.buttonPadding.right}px ${content.buttonPadding.bottom}px ${content.buttonPadding.left}px; text-decoration: none; font-size: ${content.fontSize}px;">
    ${content.text}
  </a>
</td>`
    }

    if (elementType === "divider") {
      const content = selectedElement
      let section: any = null

      for (const s of sections) {
        for (const col of s.columns) {
          if (col.content.find((c) => c.id === content.id)) {
            section = s
            break
          }
        }
        if (section) break
      }

      return `<td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px; vertical-align: ${section?.verticalAlign || "top"};">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tbody>
      <tr>
        <td style="border-top: ${content.height}px solid ${content.color}; font-size: 0; line-height: 0;">
          &nbsp;
        </td>
      </tr>
    </tbody>
  </table>
</td>`
    }

    return ""
  }

  const handleShowSource = () => {
    const html = generateElementHTML()
    setSourceHTML(html)
    setShowSourceModal(true)
  }

  if (!selectedElement) {
    return (
      <Card className="w-80 h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Canvas Properties</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Canvas Width (px)</Label>
              <Input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                min={320}
                max={800}
              />
              <p className="text-xs text-muted-foreground">Recommended: 600px for desktop, 320-480px for mobile</p>
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={canvasBackgroundColor}
                  onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  type="text"
                  value={canvasBackgroundColor}
                  onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Select an element in the canvas to edit its properties</p>
            </div>
          </div>
        </ScrollArea>
      </Card>
    )
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Properties</h2>
          <p className="text-sm text-muted-foreground capitalize">{elementType}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleShowSource} className="h-8 w-8" title="Show HTML source">
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => selectElement(null)}
            className="h-8 w-8"
            title="Close properties (show canvas)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {elementType === "column" && hasWidthError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Column widths must total 100%. Current total: {totalColumnWidth.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}

          {/* Text Properties */}
          {elementType === "text" && (
            <>
              <div className="space-y-2">
                <Label>Content</Label>
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-muted rounded-md">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertHtmlTag("strong")}
                    title="Bold"
                    className="h-8 w-8 p-0"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertHtmlTag("em")}
                    title="Italic"
                    className="h-8 w-8 p-0"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertHtmlTag("u")}
                    title="Underline"
                    className="h-8 w-8 p-0"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 ml-2">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-8 w-8 p-0 border-0"
                      title="Text color"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={insertColorSpan}
                      title="Apply color"
                      className="h-8 w-8 p-0"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-1">
                    <Input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="URL"
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={insertLink}
                      title="Insert link"
                      className="h-8 w-8 p-0"
                      disabled={!linkUrl}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML
                    updateElement(selectedElementId!, { content })
                  }}
                  className="min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  style={{
                    fontSize: selectedElement.fontSize,
                    color: selectedElement.color,
                    fontFamily: selectedElement.fontFamily,
                    lineHeight: selectedElement.lineHeight,
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Select text and use buttons above to format. Text will appear as it will in the email.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <Select
                  value={selectedElement.textAlign}
                  onValueChange={(value) => updateElement(selectedElementId!, { textAlign: value })}
                >
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

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateElement(selectedElementId!, { fontSize: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElementId!, { color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElementId!, { color: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={selectedElement.fontFamily}
                  onValueChange={(value) => updateElement(selectedElementId!, { fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                    <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                    <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Line Height</Label>
                <Slider
                  value={[selectedElement.lineHeight]}
                  onValueChange={([value]) => updateElement(selectedElementId!, { lineHeight: value })}
                  min={1}
                  max={3}
                  step={0.1}
                />
                <div className="text-sm text-muted-foreground text-right">{selectedElement.lineHeight}</div>
              </div>
            </>
          )}

          {/* Image Properties */}
          {elementType === "image" && (
            <>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={selectedElement.src}
                  onChange={(e) => updateElement(selectedElementId!, { src: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={selectedElement.alt}
                  onChange={(e) => updateElement(selectedElementId!, { alt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Link URL (optional)</Label>
                <Input
                  value={selectedElement.link || ""}
                  onChange={(e) => updateElement(selectedElementId!, { link: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Width</Label>
                  <Select
                    value={selectedElement.widthUnit || "%"}
                    onValueChange={(value: "%" | "px") => updateElement(selectedElementId!, { widthUnit: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="px">px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedElement.widthUnit === "%" ? (
                  <>
                    <Slider
                      value={[selectedElement.width]}
                      onValueChange={([value]) => updateElement(selectedElementId!, { width: value })}
                      min={10}
                      max={100}
                      step={5}
                    />
                    <div className="text-sm text-muted-foreground text-right">{selectedElement.width}%</div>
                  </>
                ) : (
                  <Input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => updateElement(selectedElementId!, { width: Number(e.target.value) })}
                    placeholder="600"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedElement.align}
                  onValueChange={(value) => updateElement(selectedElementId!, { align: value })}
                >
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

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="padding">
                  <AccordionTrigger>Padding</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Top</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.top}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, top: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Right</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.right}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, right: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bottom</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.bottom}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, bottom: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Left</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.left}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, left: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Button Properties */}
          {elementType === "button" && (
            <>
              {console.log("[v0] Button element selected:", selectedElement)}
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={selectedElement.text}
                  onChange={(e) => updateElement(selectedElementId!, { text: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={selectedElement.href}
                  onChange={(e) => updateElement(selectedElementId!, { href: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => updateElement(selectedElementId!, { color: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={
                    selectedElement.backgroundColor === "transparent" ? "#ffffff" : selectedElement.backgroundColor
                  }
                  onChange={(e) => updateElement(selectedElementId!, { backgroundColor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateElement(selectedElementId!, { fontSize: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Input
                  type="number"
                  value={selectedElement.borderRadius}
                  onChange={(e) => updateElement(selectedElementId!, { borderRadius: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Button Padding (Inner)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Top</Label>
                    <Input
                      type="number"
                      value={selectedElement.buttonPadding.top}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          buttonPadding: { ...selectedElement.buttonPadding, top: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Right</Label>
                    <Input
                      type="number"
                      value={selectedElement.buttonPadding.right}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          buttonPadding: { ...selectedElement.buttonPadding, right: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bottom</Label>
                    <Input
                      type="number"
                      value={selectedElement.buttonPadding.bottom}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          buttonPadding: { ...selectedElement.buttonPadding, bottom: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Left</Label>
                    <Input
                      type="number"
                      value={selectedElement.buttonPadding.left}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          buttonPadding: { ...selectedElement.buttonPadding, left: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Outer Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Top</Label>
                    <Input
                      type="number"
                      value={selectedElement.padding.top}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          padding: { ...selectedElement.padding, top: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Right</Label>
                    <Input
                      type="number"
                      value={selectedElement.padding.right}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          padding: { ...selectedElement.padding, right: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bottom</Label>
                    <Input
                      type="number"
                      value={selectedElement.padding.bottom}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          padding: { ...selectedElement.padding, bottom: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Left</Label>
                    <Input
                      type="number"
                      value={selectedElement.padding.left}
                      onChange={(e) =>
                        updateElement(selectedElementId!, {
                          padding: { ...selectedElement.padding, left: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedElement.align}
                  onValueChange={(value) => updateElement(selectedElementId!, { align: value })}
                >
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
            </>
          )}

          {/* Divider Properties */}
          {elementType === "divider" && (
            <>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => updateElement(selectedElementId!, { color: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement(selectedElementId!, { height: Number(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* Column Properties */}
          {elementType === "column" && (
            <>
              <div className="space-y-2">
                <Label>Width (%)</Label>
                <Input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement(selectedElementId!, { width: Number(e.target.value) })}
                  min={10}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Total width in section: {totalColumnWidth.toFixed(1)}%</p>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={
                    selectedElement.backgroundColor === "transparent" ? "#ffffff" : selectedElement.backgroundColor
                  }
                  onChange={(e) => updateElement(selectedElementId!, { backgroundColor: e.target.value })}
                />
              </div>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="visibility">
                  <AccordionTrigger className="text-sm font-semibold">Visibility</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="column-hide-mobile"
                        checked={selectedElement.hideOnMobile || false}
                        onCheckedChange={(checked) =>
                          updateElement(selectedElementId!, { hideOnMobile: checked === true })
                        }
                      />
                      <label
                        htmlFor="column-hide-mobile"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hide on mobile
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="column-hide-desktop"
                        checked={selectedElement.hideOnDesktop || false}
                        onCheckedChange={(checked) =>
                          updateElement(selectedElementId!, { hideOnDesktop: checked === true })
                        }
                      />
                      <label
                        htmlFor="column-hide-desktop"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hide on desktop
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Control column visibility on different devices</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="padding">
                  <AccordionTrigger className="text-sm font-semibold">Padding</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Top</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.top}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, top: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Right</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.right}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, right: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bottom</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.bottom}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, bottom: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Left</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.left}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, left: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Section Properties */}
          {elementType === "section" && (
            <>
              <div className="space-y-2">
                <Label>Columns</Label>
                <Button
                  onClick={() => addColumnToSection(selectedElementId!)}
                  variant="outline"
                  className="w-full"
                  disabled={selectedElement.columns.length >= 4}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column ({selectedElement.columns.length}/4)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Add a column to this section. Widths will be automatically recalculated.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={selectedElement.backgroundType || "color"}
                  onValueChange={(value) => updateElement(selectedElementId!, { backgroundType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedElement.backgroundType === "color" ? (
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={
                      selectedElement.backgroundColor === "transparent" ? "#ffffff" : selectedElement.backgroundColor
                    }
                    onChange={(e) => updateElement(selectedElementId!, { backgroundColor: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Background Image URL</Label>
                    <Input
                      value={selectedElement.backgroundImage || ""}
                      onChange={(e) => updateElement(selectedElementId!, { backgroundImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fallback Color</Label>
                    <Input
                      type="color"
                      value={
                        selectedElement.backgroundColor === "transparent" ? "#ffffff" : selectedElement.backgroundColor
                      }
                      onChange={(e) => updateElement(selectedElementId!, { backgroundColor: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Used if image fails to load</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Size</Label>
                    <Select
                      value={selectedElement.backgroundSize || "cover"}
                      onValueChange={(value) => updateElement(selectedElementId!, { backgroundSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedElement.backgroundSize === "custom" && (
                    <div className="space-y-2">
                      <Label>Custom Size</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Width</Label>
                          <Input
                            value={selectedElement.backgroundSizeWidth || "100%"}
                            onChange={(e) => updateElement(selectedElementId!, { backgroundSizeWidth: e.target.value })}
                            placeholder="100% or 600px"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height</Label>
                          <Input
                            value={selectedElement.backgroundSizeHeight || "auto"}
                            onChange={(e) =>
                              updateElement(selectedElementId!, { backgroundSizeHeight: e.target.value })
                            }
                            placeholder="auto or 300px"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Use %, px, or auto</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Background Position</Label>
                    <Select
                      value={selectedElement.backgroundPosition || "center center"}
                      onValueChange={(value) => updateElement(selectedElementId!, { backgroundPosition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left top">Left Top</SelectItem>
                        <SelectItem value="center top">Center Top</SelectItem>
                        <SelectItem value="right top">Right Top</SelectItem>
                        <SelectItem value="left center">Left Center</SelectItem>
                        <SelectItem value="center center">Center Center</SelectItem>
                        <SelectItem value="right center">Right Center</SelectItem>
                        <SelectItem value="left bottom">Left Bottom</SelectItem>
                        <SelectItem value="center bottom">Center Bottom</SelectItem>
                        <SelectItem value="right bottom">Right Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Repeat</Label>
                    <Select
                      value={selectedElement.backgroundRepeat || "no-repeat"}
                      onValueChange={(value) => updateElement(selectedElementId!, { backgroundRepeat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-repeat">No Repeat</SelectItem>
                        <SelectItem value="repeat">Repeat</SelectItem>
                        <SelectItem value="repeat-x">Repeat X</SelectItem>
                        <SelectItem value="repeat-y">Repeat Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Vertical Alignment</Label>
                <Select
                  value={selectedElement.verticalAlign}
                  onValueChange={(value) => updateElement(selectedElementId!, { verticalAlign: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Applies to all content within this section's columns</p>
              </div>

              {selectedElement.columns.length > 1 && (
                <div className="space-y-2">
                  <Label>Mobile Behavior</Label>
                  <Select
                    value={selectedElement.mobileColumnBehavior}
                    onValueChange={(value) => updateElement(selectedElementId!, { mobileColumnBehavior: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stack">Stack (100% width)</SelectItem>
                      <SelectItem value="inline">Keep side-by-side</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How columns should display on mobile devices (under 480px)
                  </p>
                </div>
              )}

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="visibility">
                  <AccordionTrigger className="text-sm font-semibold">Visibility</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="section-hide-mobile"
                        checked={selectedElement.hideOnMobile || false}
                        onCheckedChange={(checked) =>
                          updateElement(selectedElementId!, { hideOnMobile: checked === true })
                        }
                      />
                      <label
                        htmlFor="section-hide-mobile"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hide on mobile
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="section-hide-desktop"
                        checked={selectedElement.hideOnDesktop || false}
                        onCheckedChange={(checked) =>
                          updateElement(selectedElementId!, { hideOnDesktop: checked === true })
                        }
                      />
                      <label
                        htmlFor="section-hide-desktop"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hide on desktop
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Control section visibility on different devices</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="padding">
                  <AccordionTrigger className="text-sm font-semibold">Padding</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Top</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.top}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, top: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Right</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.right}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, right: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bottom</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.bottom}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, bottom: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Left</Label>
                        <Input
                          type="number"
                          value={selectedElement.padding.left}
                          onChange={(e) =>
                            updateElement(selectedElementId!, {
                              padding: { ...selectedElement.padding, left: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Padding (for all elements except button which has its own) */}
          {elementType !== "button" && (
            <div className="space-y-2">
              <Label>Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Top</Label>
                  <Input
                    type="number"
                    value={selectedElement.padding.top}
                    onChange={(e) =>
                      updateElement(selectedElementId!, {
                        padding: { ...selectedElement.padding, top: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Right</Label>
                  <Input
                    type="number"
                    value={selectedElement.padding.right}
                    onChange={(e) =>
                      updateElement(selectedElementId!, {
                        padding: { ...selectedElement.padding, right: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Bottom</Label>
                  <Input
                    type="number"
                    value={selectedElement.padding.bottom}
                    onChange={(e) =>
                      updateElement(selectedElementId!, {
                        padding: { ...selectedElement.padding, bottom: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Left</Label>
                  <Input
                    type="number"
                    value={selectedElement.padding.left}
                    onChange={(e) =>
                      updateElement(selectedElementId!, {
                        padding: { ...selectedElement.padding, left: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>HTML Source - {elementType}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={sourceHTML}
              readOnly
              className="font-mono text-xs h-[60vh]"
              onClick={(e) => e.currentTarget.select()}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Click the text area to select all. This is the HTML code for the selected {elementType}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
