"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle2, XCircle } from "lucide-react"

export function DriveUploadForm() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/drive/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      setMessage({ type: "success", text: `Successfully uploaded ${file.name}` })
      // Reset input
      e.target.value = ""
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload file",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Upload files</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">Select a file to upload to your Google Drive</p>
        <label htmlFor="file-upload">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={uploading} asChild>
            <span>{uploading ? "Uploading..." : "Select File"}</span>
          </Button>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}
