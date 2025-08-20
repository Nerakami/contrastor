"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BlockSidebar } from "@/components/drag-drop-editor/block-sidebar"
import { BlockRenderer } from "@/components/drag-drop-editor/block-renderer"
import { BlockEditor } from "@/components/drag-drop-editor/block-editor"
import type { EmailBlock, EmailContent } from "@/components/drag-drop-editor/block-types"
import { ArrowLeft, Save, Eye, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveEmailContent } from "@/lib/editor-actions"
import { createClient } from "@/lib/supabase/client"

export default function DragDropEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)
  const [content, setContent] = useState<EmailContent>({ blocks: [] })
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
        .eq("id", params.id)
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
      if (emailData.content && emailData.content.blocks) {
        setContent(emailData.content)
      } else {
        // If content is null or doesn't have blocks, use default structure
        setContent({ blocks: [] })
      }
    }

    loadData()
  }, [params.id, router, supabase])

  const handleAddBlock = (block: EmailBlock) => {
    setContent((prev) => ({
      blocks: [...(prev.blocks || []), block], // Add defensive check for blocks
    }))
  }

  const handleUpdateBlock = (updatedBlock: EmailBlock) => {
    setContent((prev) => ({
      blocks: (prev.blocks || []).map((block) => (block.id === updatedBlock.id ? updatedBlock : block)), // Add defensive check for blocks
    }))
  }

  const handleDeleteBlock = (blockId: string) => {
    setContent((prev) => ({
      blocks: (prev.blocks || []).filter((block) => block.id !== blockId), // Add defensive check for blocks
    }))
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveEmailContent(params.id, content)
      if (result.error) {
        console.error("Save error:", result.error)
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const generateHTML = () => {
    const blocks = content.blocks || []
    const blocksHTML = blocks
      .map((block) => {
        switch (block.type) {
          case "text":
            return `
            <div style="
              font-size: ${block.style.fontSize}px;
              font-weight: ${block.style.fontWeight};
              text-align: ${block.style.textAlign};
              color: ${block.style.color};
              ${block.style.backgroundColor !== "transparent" ? `background-color: ${block.style.backgroundColor};` : ""}
              padding: ${block.style.padding}px;
            ">
              ${block.content}
            </div>
          `
          case "image":
            return `
            <div style="text-align: ${block.style.textAlign}; padding: ${block.style.padding}px;">
              <img src="${block.src}" alt="${block.alt}" style="width: ${block.style.width}; height: ${block.style.height}; max-width: 100%;" />
            </div>
          `
          case "button":
            return `
            <div style="text-align: ${block.style.textAlign}; padding: ${block.style.padding}px;">
              <a href="${block.href}" style="
                display: inline-block;
                background-color: ${block.style.backgroundColor};
                color: ${block.style.color};
                padding: ${block.style.padding}px 24px;
                border-radius: ${block.style.borderRadius}px;
                text-decoration: none;
                font-size: ${block.style.fontSize}px;
                font-weight: 500;
              ">
                ${block.text}
              </a>
            </div>
          `
          case "spacer":
            return `<div style="height: ${block.height}px;"></div>`
          case "divider":
            return `
            <div style="padding: ${block.style.padding}px;">
              <hr style="border: none; border-top: ${block.style.thickness}px solid ${block.style.color}; margin: 0;" />
            </div>
          `
          default:
            return ""
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

  const selectedBlock = selectedBlockId ? (content.blocks || []).find((b) => b.id === selectedBlockId) || null : null // Add defensive check for blocks

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
            <Link href={`/editor/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
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

        <div className="grid grid-cols-12 gap-6">
          {/* Block Sidebar */}
          <div className="col-span-3">
            <BlockSidebar onAddBlock={handleAddBlock} />
          </div>

          {/* Canvas */}
          <div className="col-span-6">
            <Card>
              <CardContent className="p-4">
                <div className="bg-white min-h-96 border rounded-lg p-4">
                  {!content.blocks || content.blocks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Start building your email by adding blocks from the sidebar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(content.blocks || []).map((block) => (
                        <BlockRenderer
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onDelete={() => handleDeleteBlock(block.id)}
                          onEdit={() => setSelectedBlockId(block.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <div className="col-span-3">
            <BlockEditor block={selectedBlock} onUpdate={handleUpdateBlock} onClose={() => setSelectedBlockId(null)} />
          </div>
        </div>
      </div>
    </div>
  )
}
