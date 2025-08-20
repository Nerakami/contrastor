import { DashboardNav } from "@/components/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import InviteMemberForm from "@/components/invite-member-form"
import { FolderCard } from "@/components/folder-card"
import { EmailCard } from "@/components/email-card"
import { Users, Mail, Folder, Plus, Crown, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function GroupPage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    redirect("/dashboard/groups/new")
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get group details
  const { data: group, error: groupError } = await supabase.from("groups").select("*").eq("id", params.id).single()

  if (groupError || !group) {
    notFound()
  }

  // Check if user is a member of this group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  // Get group members
  const { data: members } = await supabase
    .from("group_members")
    .select(`
      *,
      users(id, email, full_name, avatar_url)
    `)
    .eq("group_id", params.id)
    .order("joined_at", { ascending: true })

  // Get folders in this group
  const { data: folders } = await supabase
    .from("folders")
    .select(`
      *,
      emails(count)
    `)
    .eq("group_id", params.id)
    .order("created_at", { ascending: false })

  // Get recent emails in this group
  const { data: emails } = await supabase
    .from("emails")
    .select("*")
    .eq("group_id", params.id)
    .order("updated_at", { ascending: false })
    .limit(6)

  const userProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || "",
  }

  const isAdmin = membership.role === "admin"

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

        {/* Group Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Users className="h-8 w-8 mr-3 text-primary" />
                {group.name}
              </h1>
              {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? <Crown className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                {membership.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Folders</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emails?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Emails */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Emails</h2>
                <Button size="sm" asChild>
                  <Link href="/dashboard/create">
                    <Plus className="h-4 w-4 mr-2" />
                    New Email
                  </Link>
                </Button>
              </div>
              {emails && emails.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {emails.map((email) => (
                    <EmailCard key={email.id} email={email} groupId={params.id} folderId={email.folder_id} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No emails yet</p>
                    <Button asChild>
                      <Link href="/dashboard/create">Create Your First Email</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Folders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Folders</h2>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </div>
              {folders && folders.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={{
                        ...folder,
                        email_count: folder.emails?.length || 0,
                      }}
                      groupId={params.id}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="text-center py-8">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No folders yet</p>
                    <Button variant="outline">Create Your First Folder</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Members (Admin Only) */}
            {isAdmin && <InviteMemberForm groupId={params.id} />}

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>{members?.length || 0} members in this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.users?.avatar_url || ""} />
                          <AvatarFallback>
                            {member.users?.full_name
                              ? member.users.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : member.users?.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.users?.full_name || "User"}</p>
                          <p className="text-xs text-muted-foreground">{member.users?.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {member.role === "admin" ? (
                          <Crown className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
