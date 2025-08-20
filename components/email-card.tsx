"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MoreHorizontal, Edit, Trash2, Code, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

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
}

export function EmailCard({ email, groupId, folderId }: EmailCardProps) {
  const editorIcon = email.editor_type === "drag-drop" ? Palette : Code
  const EditorIcon = editorIcon

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
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
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
