import { DashboardNav } from "@/components/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Crown, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function GroupsPage() {
  const supabase = createClient()

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
      group_members!inner(role, joined_at),
      _count_members:group_members(count),
      _count_emails:emails(count)
    `)
    .eq("group_members.user_id", user.id)
    .order("created_at", { ascending: false })

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
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Groups</h1>
            <p className="text-muted-foreground">Manage your team workspaces and collaborations</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/groups/new">
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Link>
          </Button>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      {group.name}
                    </CardTitle>
                    <Badge variant={group.group_members[0]?.role === "admin" ? "default" : "secondary"}>
                      {group.group_members[0]?.role === "admin" ? (
                        <Crown className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {group.group_members[0]?.role}
                    </Badge>
                  </div>
                  <CardDescription>{group.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{group._count_members?.[0]?.count || 0} members</span>
                      <span>{group._count_emails?.[0]?.count || 0} emails</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild className="w-full bg-transparent">
                    <Link href={`/dashboard/groups/${group.id}`}>View Group</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first group to start collaborating with your team
              </p>
              <Button asChild>
                <Link href="/dashboard/groups/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
