"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Mail, Palette, Code, Folder, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createEmail } from "@/lib/email-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CreateFolderForm from "./create-folder-form"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating email...
        </>
      ) : (
        "Create Email"
      )}
    </Button>
  )
}

interface CreateEmailFormProps {
  groups: Array<{
    id: string
    name: string
    folders?: Array<{
      id: string
      name: string
    }>
  }>
}

export default function CreateEmailForm({ groups }: CreateEmailFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createEmail, null)
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedFolder, setSelectedFolder] = useState<string>("none") // Updated default value to "none"
  const [editorType, setEditorType] = useState<string>("drag-drop")
  const [showCreateFolder, setShowCreateFolder] = useState(false)

  useEffect(() => {
    if (state?.success && state?.emailId) {
      router.push(`/editor/${state.emailId}`)
    }
  }, [state, router])

  const selectedGroupData = groups.find((g) => g.id === selectedGroup)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create New Email</CardTitle>
        <CardDescription>Choose your editor and get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {/* Email Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Email Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Newsletter - January 2024"
              required
              className="w-full"
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="groupId">Group</Label>
            <Select name="groupId" value={selectedGroup} onValueChange={setSelectedGroup} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Folder Selection */}
          {selectedGroup && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="folderId">Folder (Optional)</Label>
                <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                      <DialogDescription>Add a new folder to organize your emails</DialogDescription>
                    </DialogHeader>
                    <CreateFolderForm
                      groupId={selectedGroup}
                      onSuccess={(folderId) => {
                        setSelectedFolder(folderId)
                        setShowCreateFolder(false)
                        // Refresh the page to show the new folder
                        window.location.reload()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Select name="folderId" value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem> {/* Updated value to "none" */}
                  {selectedGroupData?.folders?.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Editor Type Selection */}
          <div className="space-y-4">
            <Label>Choose Your Editor</Label>
            <RadioGroup
              name="editorType"
              value={editorType}
              onValueChange={setEditorType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="drag-drop" id="drag-drop" className="peer sr-only" />
                <Label
                  htmlFor="drag-drop"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Palette className="h-8 w-8 mb-2 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Drag & Drop</div>
                    <div className="text-sm text-muted-foreground">Visual editor with blocks</div>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="code" id="code" className="peer sr-only" />
                <Label
                  htmlFor="code"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Code className="h-8 w-8 mb-2 text-accent" />
                  <div className="text-center">
                    <div className="font-semibold">Code Editor</div>
                    <div className="text-sm text-muted-foreground">HTML & CSS from scratch</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
