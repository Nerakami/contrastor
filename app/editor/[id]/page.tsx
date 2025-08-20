import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { EditorTypeSelector } from "@/components/editor-type-selector"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { type?: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get email details
  const { data: email, error: emailError } = await supabase
    .from("emails")
    .select(`
      *,
      groups(name),
      folders(name)
    `)
    .eq("id", params.id)
    .single()

  if (emailError || !email) {
    notFound()
  }

  // Check if user has access to this email
  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", email.group_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  const userProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  // If type is specified in URL, redirect to the appropriate editor
  if (searchParams.type === "drag-drop" && email.editor_type === "drag-drop") {
    redirect(`/editor/${params.id}/drag-drop`)
  }
  if (searchParams.type === "code" && email.editor_type === "code") {
    redirect(`/editor/${params.id}/code`)
  }

  // If email has a specific editor type, redirect to it
  if (email.editor_type === "drag-drop") {
    redirect(`/editor/${params.id}/drag-drop`)
  }
  if (email.editor_type === "code") {
    redirect(`/editor/${params.id}/code`)
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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Email Settings
          </Button>
        </div>

        {/* Email Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{email.name}</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span>{email.groups?.name}</span>
            {email.folders && <span>• {email.folders.name}</span>}
          </div>
        </div>

        {/* Editor Selection */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Choose Your Editor</h2>
            <p className="text-muted-foreground">Select how you want to build your email</p>
          </div>
          <EditorTypeSelector emailId={params.id} currentType={email.editor_type} />
        </div>
      </div>
    </div>
  )
}
