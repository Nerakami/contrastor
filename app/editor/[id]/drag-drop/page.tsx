"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Download, Maximize, X, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEmailBuilderStore } from "@/lib/email-builder/store"
import { LeftSidebar } from "@/components/email-builder/left-sidebar"
import { Canvas } from "@/components/email-builder/canvas"
import { RightSidebar } from "@/components/email-builder/right-sidebar"
import { PreviewModal } from "@/components/email-builder/preview-modal"

export default function DragDropEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [subject, setSubject] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const supabase = createClient()
  const { sections, addSection, addContent, moveSection, moveContent, loadDesign } = useEmailBuilderStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data: emailData, error } = await supabase
        .from("emails")
        .select(`
          id,
          name,
          content,
          html_content,
          css_content,
          editor_type,
          group_id,
          folder_id,
          created_by,
          created_at,
          updated_at,
          groups(name),
          folders(name)
        `)
        .eq("id", params.id)
        .single()

      if (error || !emailData) {
        console.error("[v0] Error loading email:", error)
        router.push("/dashboard")
        return
      }

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
      setSubject(emailData.name || "")

      // Load saved design if it exists
      if (emailData.content?.design) {
        console.log("[v0] Loading design:", emailData.content.design)
        loadDesign(emailData.content.design)
      }
    }

    loadData()
  }, [params.id, router, supabase, loadDesign])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    document.body.style.cursor = "grabbing"
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    document.body.style.cursor = ""

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Dragging from sidebar to canvas
    if (activeData?.type?.startsWith("section-")) {
      const columnCount = Number.parseInt(activeData.type.split("-")[1])

      if (overData?.type === "canvas") {
        addSection(columnCount)
      } else if (overData?.type === "drop-zone") {
        addSection(columnCount, overData.index)
      } else if (overData?.type === "section") {
        addSection(columnCount, overData.index + 1)
      }
    }

    // Dragging content from sidebar to column
    else if (activeData?.type?.startsWith("content-")) {
      const contentType = activeData.type.split("-")[1] as any

      if (overData?.type === "column") {
        addContent(overData.sectionId, overData.columnId, contentType)
      } else if (overData?.type === "content") {
        addContent(overData.sectionId, overData.columnId, contentType, overData.index + 1)
      }
    }

    // Reordering sections
    else if (activeData?.type === "section" && overData?.type === "section") {
      if (active.id !== over.id) {
        moveSection(activeData.index, overData.index)
      }
    }

    // Reordering content within a column
    else if (activeData?.type === "content" && overData?.type === "content") {
      if (activeData.sectionId === overData.sectionId && activeData.columnId === overData.columnId) {
        if (active.id !== over.id) {
          moveContent(activeData.sectionId, activeData.columnId, activeData.index, overData.index)
        }
      }
    }
  }

  const exportToHtml = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-hide { display: none !important; }
    }
    @media only screen and (min-width: 601px) {
      .desktop-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${useEmailBuilderStore.getState().canvasBackgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="${useEmailBuilderStore.getState().canvasWidth}" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: ${useEmailBuilderStore.getState().canvasWidth}px;">
          ${sections
            .map((section) => {
              const sectionClass =
                `${section.hideOnMobile ? "mobile-hide" : ""} ${section.hideOnDesktop ? "desktop-hide" : ""}`.trim()

              // Build background styles
              let backgroundStyle = ""
              let msoCode = ""

              if (section.backgroundType === "image" && section.backgroundImage) {
                const bgSize =
                  section.backgroundSize === "custom"
                    ? `${section.backgroundSizeWidth} ${section.backgroundSizeHeight}`
                    : section.backgroundSize

                backgroundStyle = `background-image: url(${section.backgroundImage}); background-size: ${bgSize}; background-position: ${section.backgroundPosition}; background-repeat: ${section.backgroundRepeat};`

                // MSO conditional code for Outlook
                msoCode = `
                <!--[if gte mso 9]>
                <v:image xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; width: ${useEmailBuilderStore.getState().canvasWidth}px; height: auto;" src="${section.backgroundImage}" />
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="border: 0; display: inline-block; position: absolute; width: ${useEmailBuilderStore.getState().canvasWidth}px;">
                  <v:fill opacity="0%" color="${section.backgroundColor}" />
                  <v:textbox inset="0,0,0,0">
                <![endif]-->
                `
              } else {
                backgroundStyle = `background-color: ${section.backgroundColor};`
              }

              const closeMsoCode =
                section.backgroundType === "image" && section.backgroundImage
                  ? `
                <!--[if gte mso 9]>
                  </v:textbox>
                </v:rect>
                </v:image>
                <![endif]-->
              `
                  : ""

              return `
          <tr${sectionClass ? ` class="${sectionClass}"` : ""}>
            <td style="${backgroundStyle} padding: ${section.padding.top}px ${section.padding.right}px ${section.padding.bottom}px ${section.padding.left}px;">
              ${msoCode}
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${section.columns
                    .map((column) => {
                      const columnClass =
                        `${column.hideOnMobile ? "mobile-hide" : section.mobileColumnBehavior === "stack" ? "mobile-stack" : ""} ${column.hideOnDesktop ? "desktop-hide" : ""}`.trim()

                      return `
                  <td width="${column.width}%" valign="${section.verticalAlign || "top"}" style="background-color: ${column.backgroundColor}; padding: ${column.padding.top}px ${column.padding.right}px ${column.padding.bottom}px ${column.padding.left}px;"${columnClass ? ` class="${columnClass}"` : ""}>
                    ${column.content
                      .map((content) => {
                        switch (content.type) {
                          case "text":
                            return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size: ${content.fontSize}px; font-family: ${content.fontFamily}; color: ${content.color}; line-height: ${content.lineHeight}; padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px;" align="${content.textAlign}">${content.content}</td></tr></table>`
                          case "image":
                            return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${content.align}" style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px;"><img src="${content.src}" alt="${content.alt}" style="width: ${content.width}%; max-width: 100%; display: block;" /></td></tr></table>`
                          case "button":
                            return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${content.align}" style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px;"><a href="${content.href}" target="_blank" style="display: inline-block; font-size: ${content.fontSize}px; color: ${content.color}; background-color: ${content.backgroundColor}; border-radius: ${content.borderRadius}px; padding: ${content.buttonPadding.top}px ${content.buttonPadding.right}px ${content.buttonPadding.bottom}px ${content.buttonPadding.left}px; text-decoration: none;">${content.text}</a></td></tr></table>`
                          case "divider":
                            return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: ${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px;"><hr style="border: none; border-top: ${content.height}px solid ${content.color}; margin: 0;" /></td></tr></table>`
                          default:
                            return ""
                        }
                      })
                      .join("")}
                  </td>
                  `
                    })
                    .join("")}
                </tr>
              </table>
              ${closeMsoCode}
            </td>
          </tr>
          `
            })
            .join("")}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    return html
  }

  const handleExport = () => {
    console.log("[v0] Exporting HTML...")
    try {
      const html = exportToHtml()
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${email?.name || "email"}.html`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
      }, 100)
      console.log("[v0] Export successful")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export HTML")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const html = exportToHtml()
      const design = {
        sections,
        canvasWidth: useEmailBuilderStore.getState().canvasWidth,
        canvasBackgroundColor: useEmailBuilderStore.getState().canvasBackgroundColor,
      }

      console.log("[v0] Saving design:", design)

      const { error } = await supabase
        .from("emails")
        .update({
          content: { design, html },
          html_content: html,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        console.error("[v0] Save error:", error)
        alert(`Failed to save: ${error.message}`)
      } else {
        console.log("[v0] Save successful")
      }

      setIsSaving(false)
    } catch (error) {
      console.error("[v0] Save error:", error)
      alert("Failed to save email")
      setIsSaving(false)
    }
  }

  if (!user || !email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        {!isFullscreen && <DashboardNav user={userProfile} />}

        <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}>
          <div className={isFullscreen ? "h-full flex flex-col" : "container mx-auto px-4 py-8"}>
            <div className={`mb-6 flex items-center justify-between ${isFullscreen ? "px-4 pt-4" : ""}`}>
              {!isFullscreen && (
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              )}
              {isFullscreen && <div />}
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export HTML
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                {!isFullscreen ? (
                  <Button variant="outline" size="icon" onClick={() => setIsFullscreen(true)}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" onClick={() => setIsFullscreen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {!isFullscreen && (
              <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2">{email.name}</h1>
                <p className="text-muted-foreground mb-4">
                  {email.groups?.name} {email.folders && `• ${email.folders.name}`}
                </p>
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>
              </div>
            )}

            <div className={`flex gap-4 ${isFullscreen ? "flex-1 overflow-hidden" : "h-[calc(100vh-300px)]"}`}>
              <LeftSidebar />
              <Canvas activeId={activeId} />
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>

      <PreviewModal open={showPreview} onOpenChange={setShowPreview} subject={subject} />

      <DragOverlay>
        {activeId ? (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 shadow-lg">
            <div className="text-sm font-medium">
              {activeId.toString().startsWith("section-") && "Structure Block"}
              {activeId.toString().startsWith("content-") && "Content Block"}
              {!activeId.toString().startsWith("section-") &&
                !activeId.toString().startsWith("content-") &&
                "Moving..."}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
