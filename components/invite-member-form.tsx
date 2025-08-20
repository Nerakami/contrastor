"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import { inviteToGroup } from "@/lib/group-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending invitation...
        </>
      ) : (
        "Send Invitation"
      )}
    </Button>
  )
}

interface InviteMemberFormProps {
  groupId: string
  onSuccess?: () => void
}

export default function InviteMemberForm({ groupId, onSuccess }: InviteMemberFormProps) {
  const [state, formAction] = useActionState(inviteToGroup, null)

  // Reset form and call onSuccess when invitation is sent
  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Member
        </CardTitle>
        <CardDescription>Send an invitation to join this group</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="groupId" value={groupId} />

          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded-md text-sm">
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
              className="w-full"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
