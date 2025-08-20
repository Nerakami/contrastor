import { DashboardNav } from "@/components/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateEmailForm from "@/components/create-email-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function CreateEmailPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get user's groups with folders - fix the query
  const { data: groups } = await supabase
    .from("groups")
    .select(`
      id,
      name,
      folders(id, name),
      group_members!inner(user_id)
    `)
    .eq("group_members.user_id", user.id)
    .order("name", { ascending: true })

  const userProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  // If user has no groups, redirect to create group
  if (!groups || groups.length === 0) {
    redirect("/dashboard/groups/new")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={userProfile} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <CreateEmailForm groups={groups} />
        </div>
      </div>
    </div>
  )
}
