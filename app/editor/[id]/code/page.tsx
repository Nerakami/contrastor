"use client"

import { useState, useEffect, use } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonacoEditor } from "@/components/code-editor/monaco-editor"
import { LivePreview } from "@/components/code-editor/live-preview"
import { CodeTemplates } from "@/components/code-editor/code-templates"
import { ArrowLeft, Save, Eye, Download, Code, FileText, Palette } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveCodeContent } from "@/lib/editor-actions"
import { createClient } from "@/lib/supabase/client"

export default function CodeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState<any>(null)
  const [htmlContent, setHtmlContent] = useState("")
  const [cssContent, setCssContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")

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
      if (emailData.html_content) {
        setHtmlContent(emailData.html_content)
      }
      if (emailData.css_content) {
        setCssContent(emailData.css_content)
      }
    }

    loadData()
  }, [id, router, supabase])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveCodeContent(id, htmlContent, cssContent)
      if (result.error) {
        console.error("Save error:", result.error)
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${email?.name || "Email"}</title>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

    const blob = new Blob([fullHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${email?.name || "email"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleTemplateSelect = (template: any) => {
    setHtmlContent(template.html)
    setCssContent(template.css)
    setActiveTab("editor")
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

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <iframe
                  className="w-full h-screen border-0"
                  title="Email Preview"
                  srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${email.name}</title>
  <style>${cssContent}</style>
</head>
<body>${htmlContent}</body>
</html>`}
                />
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
              Full Preview
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Live Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <CodeTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* HTML Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>HTML</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MonacoEditor value={htmlContent} onChange={setHtmlContent} language="html" height="500px" />
                </CardContent>
              </Card>

              {/* CSS Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>CSS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MonacoEditor value={cssContent} onChange={setCssContent} language="css" height="500px" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <LivePreview htmlContent={htmlContent} cssContent={cssContent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
