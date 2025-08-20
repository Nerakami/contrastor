import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderCard } from "@/components/folder-card"
import { EmailCard } from "@/components/email-card"
import { Plus, Users, Mail, Folder } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
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

  // Get recent emails across all groups
  const { data: recentEmails } = await supabase
    .from("emails")
    .select(`
      *,
      groups(name)
    `)
    .in("group_id", groups?.map((g) => g.id) || [])
    .order("updated_at", { ascending: false })
    .limit(6)

  // Get folders from user's groups
  const { data: folders } = await supabase
    .from("folders")
    .select(`
      *,
      groups(name),
      emails(count)
    `)
    .in("group_id", groups?.map((g) => g.id) || [])
    .order("created_at", { ascending: false })
    .limit(6)

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.full_name || "there"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your email campaigns.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active workspaces</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folders</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Organized collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentEmails?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Recent campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(!groups || groups.length === 0) && (
          <Card className="mb-8 border-dashed">
            <CardHeader className="text-center">
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Create your first group to start building email campaigns</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/dashboard/groups/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Emails */}
        {recentEmails && recentEmails.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Emails</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/emails">View All</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEmails.map((email) => (
                <EmailCard key={email.id} email={email} groupId={email.group_id} folderId={email.folder_id} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Folders */}
        {folders && folders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Folders</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/folders">View All</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={{
                    ...folder,
                    email_count: folder.emails?.length || 0,
                  }}
                  groupId={folder.group_id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        {groups && groups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Groups</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/groups">
                  <Plus className="h-4 w-4 mr-2" />
                  New Group
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      {group.name}
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Role: {group.group_members[0]?.role}</span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/groups/${group.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
