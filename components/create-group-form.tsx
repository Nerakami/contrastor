"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createGroup } from "@/lib/group-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating group...
        </>
      ) : (
        "Create Group"
      )}
    </Button>
  )
}

export default function CreateGroupForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(createGroup, null)

  useEffect(() => {
    if (state?.success && state?.groupId) {
      router.push(`/dashboard/groups/${state.groupId}`)
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create New Group</CardTitle>
        <CardDescription>Start collaborating with your team</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input id="name" name="name" type="text" placeholder="Marketing Team" required className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this group is for..."
              className="w-full"
              rows={3}
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
