"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Code, ArrowRight } from "lucide-react"
import Link from "next/link"

interface EditorTypeSelectorProps {
  emailId: string
  currentType?: "drag-drop" | "code"
}

export function EditorTypeSelector({ emailId, currentType }: EditorTypeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card className={`hover:shadow-lg transition-shadow ${currentType === "drag-drop" ? "ring-2 ring-primary" : ""}`}>
        <CardHeader className="text-center">
          <Palette className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-xl">Drag & Drop Editor</CardTitle>
          <CardDescription>
            Create emails visually with our intuitive drag-and-drop interface. Perfect for quick designs and
            non-technical users.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <span>✓ Visual blocks</span>
                <span>✓ No coding</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span>✓ Templates</span>
                <span>✓ Easy styling</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={`/editor/${emailId}?type=drag-drop`}>
                {currentType === "drag-drop" ? "Continue Editing" : "Use Drag & Drop"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`hover:shadow-lg transition-shadow ${currentType === "code" ? "ring-2 ring-primary" : ""}`}>
        <CardHeader className="text-center">
          <Code className="h-16 w-16 text-accent mx-auto mb-4" />
          <CardTitle className="text-xl">Code Editor</CardTitle>
          <CardDescription>
            Write HTML and CSS from scratch with live preview. Full control over every aspect of your email design.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <span>✓ HTML & CSS</span>
                <span>✓ Live preview</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span>✓ Full control</span>
                <span>✓ Custom code</span>
              </div>
            </div>
            <Button asChild className="w-full bg-transparent" variant="outline">
              <Link href={`/editor/${emailId}?type=code`}>
                {currentType === "code" ? "Continue Editing" : "Use Code Editor"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
