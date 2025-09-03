"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MoreHorizontal, Edit, Trash2, Code, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EmailCardProps {
  email: {
    id: string
    name: string
    editor_type: "drag-drop" | "code"
    created_at: string
    updated_at: string
  }
  groupId: string
  folderId?: string
  showDeleteButton?: boolean
}

export function EmailCard({ email, groupId, folderId, showDeleteButton = false }: EmailCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const editorIcon = email.editor_type === "drag-drop" ? Palette : Code
  const EditorIcon = editorIcon

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${email.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", email.id)

      if (error) {
        console.error("Error deleting email:", error)
        alert("Failed to delete email. Please try again.")
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting email:", error)
      alert("Failed to delete email. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Mail className="h-4 w-4 mr-2 text-primary" />
          {email.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/editor/${email.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            {showDeleteButton && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge 
              variant={email.editor_type === "drag-drop" ? "default" : "secondary"} 
              className={`text-xs ${
                email.editor_type === "drag-drop" 
                  ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
              }`}
            >
              <EditorIcon className="h-3 w-3 mr-1" />
              {email.editor_type === "drag-drop" ? "Visual" : "Code"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(email.updated_at), { addSuffix: true })}
            </span>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/editor/${email.id}`}>Edit</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
