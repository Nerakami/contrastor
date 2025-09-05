"use client"

import { useState, useEffect, use } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BlockSidebar } from "@/components/drag-drop-editor/block-sidebar"
import { BlockRenderer } from "@/components/drag-drop-editor/block-renderer"
import { BlockEditor } from "@/components/drag-drop-editor/block-editor"
import type { EmailBlock, EmailContent, ContentBlock } from "@/components/drag-drop-editor/block-types"
import { ArrowLeft, Save, Eye, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveEmailContent } from "@/lib/editor-actions"
import { createClient } from "@/lib/supabase/client"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CanvasDropZone } from "@/components/drag-drop-editor/canvas-drop-zone"

export default function DragDropEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)
  const [content, setContent] = useState<EmailContent>({ blocks: [] })
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<EmailBlock | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8,
        delay: 0,
        tolerance: 8
      } 
    })
  )

  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      // Get email
      const { data: emailData, error } = await supabase
        .from("emails")
        .select(`
          *,
          groups(name),
          folders(name)
        `)
        .eq("id", id)
        .single()

      if (error || !emailData) {
        router.push("/dashboard")
        return
      }

      // Check access
      const { data: membership } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", emailData.group_id)
        .eq("user_id", user.id)
        .single()

      if (!membership) {
        router.push("/dashboard")
        return
      }

      setEmail(emailData)
      const initialContent = emailData.content && emailData.content.blocks 
        ? emailData.content 
        : { blocks: [] }
      
      console.log("Setting initial content:", initialContent)
      setContent(initialContent)
    }

    loadData()
  }, [id, router, supabase])

  const handleAddBlock = (block: EmailBlock) => {
    console.log("Adding block to content:", block)
    setContent((prev) => {
      const newContent = {
        blocks: [...(prev.blocks || []), block]
      }
      console.log("New content after adding block:", newContent)
      return newContent
    })
  }

  const handleAddToColumn = (columnId: string, contentBlock: ContentBlock) => {
    setContent((prev) => ({
      blocks: (prev.blocks || []).map((block) => {
        if (block.type === "row") {
          const rowBlock = block as any
          return {
            ...rowBlock,
            columns: rowBlock.columns.map((col: any) => 
              col.id === columnId 
                ? { ...col, blocks: [...col.blocks, contentBlock] }
                : col
            )
          }
        }
        return block
      })
    }))
  }

  const handleUpdateBlock = (updatedBlock: EmailBlock) => {
    setContent((prev) => ({
      blocks: (prev.blocks || []).map((block) => {
        if (block.id === updatedBlock.id) {
          return updatedBlock
        }
        if (block.type === "row") {
          const rowBlock = block as any
          return {
            ...rowBlock,
            columns: rowBlock.columns.map((col: any) => ({
              ...col,
              blocks: col.blocks.map((contentBlock: any) => 
                contentBlock.id === updatedBlock.id ? updatedBlock : contentBlock
              )
            }))
          }
        }
        return block
      })
    }))
  }

  const handleDeleteBlock = (blockId?: string) => {
    if (!blockId) return
    
    setContent((prev) => ({
      blocks: (prev.blocks || []).map((block) => {
        if (block.type === "row") {
          const rowBlock = block as any
          return {
            ...rowBlock,
            columns: rowBlock.columns.map((col: any) => ({
              ...col,
              blocks: col.blocks.filter((contentBlock: any) => contentBlock.id !== blockId)
            }))
          }
        }
        return block
      }).filter((block) => block.id !== blockId)
    }))
    
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag start:", event.active.id, event.active.data.current)
    setActiveId(event.active.id as string)
    const draggedItem = event.active.data.current
    if (draggedItem) {
      setDraggedBlock(draggedItem.block)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log("Drag end:", {
      active: { id: active.id, data: active.data.current },
      over: over ? { id: over.id, data: over.data.current } : null
    })
    
    setActiveId(null)
    setDraggedBlock(null)

    if (!over) {
      console.log("No drop target found")
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    // Handle dropping from sidebar to canvas
    if (activeData?.isFromSidebar) {
      console.log("Dropping from sidebar", { activeData, overData, overId: over.id })
      
      if (overData?.columnId) {
        // Dropping into a column
        console.log("Dropping into column:", overData.columnId)
        const newBlock = activeData.block as ContentBlock
        handleAddToColumn(overData.columnId, { ...newBlock, id: `${newBlock.type}-${Date.now()}` })
      } else {
        // Dropping onto main canvas (check for canvas ID or isCanvas flag)
        console.log("Dropping onto main canvas", { isCanvas: overData?.isCanvas, overId: over.id })
        const newBlock = { ...activeData.block, id: `${activeData.block.type}-${Date.now()}` } as EmailBlock
        handleAddBlock(newBlock)
        console.log("Added block:", newBlock)
      }
      return
    }

    // Handle reordering existing blocks
    if (active.id !== over.id) {
      const activeIndex = (content.blocks || []).findIndex((block) => block.id === active.id)
      const overIndex = (content.blocks || []).findIndex((block) => block.id === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        setContent((prev) => ({
          blocks: arrayMove(prev.blocks || [], activeIndex, overIndex)
        }))
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeData = active.data.current
    const overData = over.data.current

    // Handle dropping content into columns
    if (activeData?.isFromSidebar && overData?.columnId) {
      return // Let handleDragEnd handle this
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log("Saving content:", content)
      const result = await saveEmailContent(id, content)
      if (result.error) {
        console.error("Save error:", result.error)
        alert("Error saving: " + result.error)
      } else {
        console.log("Save successful")
        alert("Content saved successfully!")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Error saving content")
    } finally {
      setIsSaving(false)
    }
  }

  const generateHTML = () => {
    const blocks = content.blocks || []
    
    const renderContentBlock = (contentBlock: any) => {
      switch (contentBlock.type) {
        case "text":
          return `
          <tr>
            <td style="
              font-size: ${contentBlock.style.fontSize}px;
              font-weight: ${contentBlock.style.fontWeight};
              font-family: ${contentBlock.style.fontFamily};
              color: ${contentBlock.style.color};
              ${contentBlock.style.backgroundColor !== "transparent" ? `background-color: ${contentBlock.style.backgroundColor};` : ""}
              padding: ${contentBlock.style.padding}px;
              line-height: ${contentBlock.style.lineHeight};
            " align="${contentBlock.style.textAlign}">
              ${contentBlock.content}
            </td>
          </tr>`
        case "image":
          return `
          <tr>
            <td align="${contentBlock.style.textAlign}" style="padding: ${contentBlock.style.padding}px;">
              ${contentBlock.href ? 
                `<a href="${contentBlock.href}">
                  <img src="${contentBlock.src}" alt="${contentBlock.alt}" style="width: ${contentBlock.style.width}; height: ${contentBlock.style.height}; max-width: 100%; display: block;" />
                </a>` :
                `<img src="${contentBlock.src}" alt="${contentBlock.alt}" style="width: ${contentBlock.style.width}; height: ${contentBlock.style.height}; max-width: 100%; display: block;" />`
              }
            </td>
          </tr>`
        case "button":
          return `
          <tr>
            <td align="${contentBlock.style.textAlign}" style="padding: ${contentBlock.style.padding}px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${contentBlock.style.backgroundColor}; border-radius: ${contentBlock.style.borderRadius}px;">
                    <a href="${contentBlock.href}" style="
                      display: block;
                      color: ${contentBlock.style.color};
                      padding: ${contentBlock.style.padding}px 24px;
                      text-decoration: none;
                      font-size: ${contentBlock.style.fontSize}px;
                      font-weight: ${contentBlock.style.fontWeight};
                    ">
                      ${contentBlock.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
        case "spacer":
          return `<tr><td style="height: ${contentBlock.height}px; line-height: ${contentBlock.height}px; font-size: 1px;">&nbsp;</td></tr>`
        case "divider":
          return `
          <tr>
            <td style="padding: ${contentBlock.style.padding}px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top: ${contentBlock.style.thickness}px solid ${contentBlock.style.color}; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>`
        default:
          return ""
      }
    }
    
    const blocksHTML = blocks
      .map((block) => {
        if (block.type === "row") {
          const rowBlock = block as any
          return `
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${rowBlock.style.backgroundColor !== "transparent" ? `background-color: ${rowBlock.style.backgroundColor};` : ""}">
            <tbody>
              <tr>
                ${rowBlock.columns.map((col: any) => `
                  <td width="${col.width}%" style="
                    ${col.style.backgroundColor !== "transparent" ? `background-color: ${col.style.backgroundColor};` : ""}
                    padding: ${col.style.padding}px;
                    vertical-align: ${col.style.verticalAlign};
                  ">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tbody>
                        ${col.blocks.length === 0 ? 
                          '<tr><td style="padding: 20px;">&nbsp;</td></tr>' :
                          col.blocks.map((contentBlock: any) => renderContentBlock(contentBlock)).join('')
                        }
                      </tbody>
                    </table>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>`
        } else {
          // Standalone content block
          return `
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tbody>
              ${renderContentBlock(block)}
            </tbody>
          </table>`
        }
      })
      .join("")

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${email?.name || "Email"}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              ${blocksHTML}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  const handleExport = () => {
    const html = generateHTML()
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${email?.name || "email"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!user || !email) {
    return <div>Loading...</div>
  }

  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  const selectedBlock = selectedBlockId ? findBlockById(selectedBlockId, content.blocks || []) : null

  function findBlockById(id: string, blocks: EmailBlock[]): EmailBlock | null {
    for (const block of blocks) {
      if (block.id === id) return block
      if (block.type === "row") {
        const rowBlock = block as any
        for (const column of rowBlock.columns) {
          for (const contentBlock of column.blocks) {
            if (contentBlock.id === id) return contentBlock
          }
        }
      }
    }
    return null
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={userProfile} />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setShowPreview(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={userProfile} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">{email.name}</h1>
          <p className="text-muted-foreground">
            {email.groups?.name} {email.folders && `• ${email.folders.name}`}
          </p>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Block Sidebar */}
            <div className="col-span-3">
              <div className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <BlockSidebar onAddBlock={handleAddBlock} />
              </div>
            </div>

            {/* Canvas */}
            <div className="col-span-6">
              <Card>
                <CardContent className="p-4">
                  <CanvasDropZone>
                    {!content.blocks || content.blocks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Start building your email by dragging blocks from the sidebar</p>
                      </div>
                    ) : (
                      <SortableContext items={(content.blocks || []).map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {(content.blocks || []).map((block) => (
                            <BlockRenderer
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              selectedBlockId={selectedBlockId}
                              onSelect={(blockId) => setSelectedBlockId(blockId || null)}
                              onDelete={handleDeleteBlock}
                              onEdit={(blockId) => setSelectedBlockId(blockId || null)}
                              onAddToColumn={handleAddToColumn}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </CanvasDropZone>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="col-span-3">
              <div className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <BlockEditor block={selectedBlock} onUpdate={handleUpdateBlock} onClose={() => setSelectedBlockId(null)} />
              </div>
            </div>
          </div>

          <DragOverlay>
            {draggedBlock && (
              <div className="opacity-75 rotate-3 transform bg-white border border-primary rounded p-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{draggedBlock.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {draggedBlock.type === 'text' ? 'Text Block' :
                     draggedBlock.type === 'image' ? 'Image Block' :
                     draggedBlock.type === 'button' ? 'Button Block' :
                     draggedBlock.type === 'row' ? `${(draggedBlock as any).columns?.length || 1} Column Layout` :
                     'Block'}
                  </span>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
