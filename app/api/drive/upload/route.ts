import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("google_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Google Drive" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
    }

    // Upload file to Google Drive
    const uploadFormData = new FormData()
    uploadFormData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
    uploadFormData.append("file", file)

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: uploadFormData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file to Google Drive")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
