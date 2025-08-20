import { createClient } from "@/lib/supabase/server"
import { acceptInvitation } from "@/lib/group-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  // Get the invitation details
  const { data: invitation, error } = await supabase
    .from("group_invitations")
    .select(`
      *,
      groups(name, description),
      invited_by_user:users!group_invitations_invited_by_fkey(full_name, email)
    `)
    .eq("token", params.token)
    .is("accepted_at", null)
    .single()

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if invitation has expired
  const isExpired = new Date(invitation.expires_at) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired. Please request a new one.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle accepting the invitation
  async function handleAccept() {
    "use server"
    await acceptInvitation(params.token)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Group Invitation</CardTitle>
          <CardDescription>You've been invited to join a group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{invitation.groups?.name}</h3>
            {invitation.groups?.description && (
              <p className="text-muted-foreground text-sm mt-1">{invitation.groups.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Invited by {invitation.invited_by_user?.full_name || invitation.invited_by_user?.email}
            </p>
          </div>

          <form action={handleAccept} className="space-y-4">
            <Button type="submit" className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept Invitation
            </Button>
          </form>

          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Maybe Later</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
