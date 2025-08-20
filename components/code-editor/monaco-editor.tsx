"use client"

import { useEffect, useRef } from "react"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: "html" | "css"
  height?: string
}

export function MonacoEditor({ value, onChange, language, height = "400px" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    const loadMonaco = async () => {
      // Simple textarea fallback for now - in a real app you'd load Monaco Editor
      if (editorRef.current) {
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.style.width = "100%"
        textarea.style.height = height
        textarea.style.fontFamily = "Monaco, 'Courier New', monospace"
        textarea.style.fontSize = "14px"
        textarea.style.border = "1px solid #e2e8f0"
        textarea.style.borderRadius = "6px"
        textarea.style.padding = "12px"
        textarea.style.resize = "none"
        textarea.style.outline = "none"
        textarea.style.backgroundColor = "#1e1e1e"
        textarea.style.color = "#d4d4d4"

        textarea.addEventListener("input", (e) => {
          onChange((e.target as HTMLTextAreaElement).value)
        })

        editorRef.current.appendChild(textarea)
        monacoRef.current = textarea

        return () => {
          if (editorRef.current && textarea) {
            editorRef.current.removeChild(textarea)
          }
        }
      }
    }

    loadMonaco()
  }, [])

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.value !== value) {
      monacoRef.current.value = value
    }
  }, [value])

  return <div ref={editorRef} className="border rounded-lg overflow-hidden" />
}
