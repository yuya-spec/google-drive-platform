import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      console.error("Failed to refresh token:", await response.text())
      return null
    }

    const tokens = await response.json()
    return tokens.access_token
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get("google_access_token")?.value
  const refreshToken = cookieStore.get("google_refresh_token")?.value

  if (!accessToken) {
    return NextResponse.json({ 
      error: "Not authenticated with Google Drive. Please reconnect your account." 
    }, { status: 401 })
  }

  // Get folder ID from query parameters
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get("folderId")

  if (!folderId) {
    return NextResponse.json({ 
      error: "Folder ID is required" 
    }, { status: 400 })
  }

  try {
    // First attempt with current access token
    let response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,parents&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    // If unauthorized, try to refresh the token
    if (response.status === 401 && refreshToken) {
      console.log("Access token expired, attempting to refresh...")
      const newAccessToken = await refreshAccessToken(refreshToken)
      
      if (newAccessToken) {
        // Update the cookie with new access token
        const updatedResponse = NextResponse.json({})
        updatedResponse.cookies.set("google_access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600, // 1 hour
        })
        
        // Retry the request with new token
        response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,parents&supportsAllDrives=true`,
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
        )
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Google Drive API error:", response.status, errorData)
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: "Authentication failed. Please reconnect your Google Drive account." 
        }, { status: 401 })
      }
      
      if (response.status === 403) {
        return NextResponse.json({ 
          error: "Access denied. Please check your Google Drive permissions." 
        }, { status: 403 })
      }
      
      throw new Error(`Google Drive API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching folder info:", error)
    return NextResponse.json({ 
      error: "Failed to fetch folder information. Please try again." 
    }, { status: 500 })
  }
}
