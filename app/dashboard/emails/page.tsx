import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { EmailCard } from "@/components/email-card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default async function EmailsPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get user's groups
  const { data: groups } = await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner(role)
    `)
    .eq("group_members.user_id", user.id)

  // Get all emails across all groups
  const { data: emails } = await supabase
    .from("emails")
    .select(`
      *,
      groups(name),
      folders(name)
    `)
    .in("group_id", groups?.map((g) => g.id) || [])
    .order("updated_at", { ascending: false })

  const userProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={userProfile} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">All Emails</h1>
                <p className="text-muted-foreground">Manage all your email campaigns</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/create">
                <Plus className="h-4 w-4 mr-2" />
                New Email
              </Link>
            </Button>
          </div>
        </div>

        {emails && emails.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {emails.map((email) => (
              <EmailCard 
                key={email.id} 
                email={email} 
                groupId={email.group_id} 
                folderId={email.folder_id}
                showDeleteButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No emails found</p>
            <Button asChild>
              <Link href="/dashboard/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Email
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
