"use client"

import { Editor } from "@monaco-editor/react"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: "html" | "css"
  height?: string
  theme?: "vs-dark" | "vs-light"
}

export function MonacoEditor({ value, onChange, language, height = "400px", theme = "vs-dark" }: MonacoEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "")
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          renderWhitespace: "selection",
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          lineHeight: 20,
          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Cascadia Code', 'Courier New', monospace",
          contextmenu: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          formatOnType: true,
          formatOnPaste: true,
          autoIndent: "full",
          bracketPairColorization: {
            enabled: true
          }
        }}
      />
    </div>
  )
}
