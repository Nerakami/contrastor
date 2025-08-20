"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LivePreviewProps {
  htmlContent: string
  cssContent: string
}

export function LivePreview({ htmlContent, cssContent }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        const fullHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Preview</title>
            <style>
              ${cssContent}
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `

        doc.open()
        doc.write(fullHTML)
        doc.close()
      }
    }
  }, [htmlContent, cssContent])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          className="w-full h-96 border-0 bg-white"
          title="Email Preview"
          sandbox="allow-same-origin"
        />
      </CardContent>
    </Card>
  )
}
