"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { createFolder } from "@/lib/email-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating folder...
        </>
      ) : (
        "Create Folder"
      )}
    </Button>
  )
}

interface CreateFolderFormProps {
  groupId: string
  onSuccess?: (folderId: string) => void
}

export default function CreateFolderForm({ groupId, onSuccess }: CreateFolderFormProps) {
  const [state, formAction] = useActionState(createFolder, null)

  useEffect(() => {
    if (state?.success && state?.folderId && onSuccess) {
      onSuccess(state.folderId)
    }
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />

      {state?.error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Folder Name</Label>
        <Input id="name" name="name" type="text" placeholder="Newsletters" required className="w-full" />
      </div>

      <SubmitButton />
    </form>
  )
}
