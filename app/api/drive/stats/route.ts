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

  try {
    // Function to make authenticated request with token refresh
    const makeAuthenticatedRequest = async (url: string) => {
      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      // If unauthorized, try to refresh the token
      if (response.status === 401 && refreshToken) {
        console.log("Access token expired, attempting to refresh...")
        const newAccessToken = await refreshAccessToken(refreshToken)
        
        if (newAccessToken) {
          accessToken = newAccessToken
          // Retry the request with new token
          response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          })
        }
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      return response.json()
    }

    // Get storage quota and usage information
    const aboutData = await makeAuthenticatedRequest(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota,user"
    )

    // Function to get total count of all items (files + folders) with pagination
    const getAllItemsCount = async () => {
      let totalCount = 0
      let nextPageToken = ""
      
      do {
        const queryParams = new URLSearchParams({
          fields: "nextPageToken,files(id)",
          pageSize: "1000",
          q: "trashed=false"
        })
        
        if (nextPageToken) {
          queryParams.append("pageToken", nextPageToken)
        }
        
        const response = await makeAuthenticatedRequest(
          `https://www.googleapis.com/drive/v3/files?${queryParams}`
        )
        
        totalCount += response.files?.length || 0
        nextPageToken = response.nextPageToken || ""
      } while (nextPageToken)
      
      return totalCount
    }

    // Get recent uploads (files modified in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentFilesData = await makeAuthenticatedRequest(
      `https://www.googleapis.com/drive/v3/files?fields=files(id,name,modifiedTime)&pageSize=1000&q=trashed=false and modifiedTime > '${sevenDaysAgo.toISOString()}'`
    )

    // Get the most recent file for "Last Activity"
    const recentActivityData = await makeAuthenticatedRequest(
      "https://www.googleapis.com/drive/v3/files?fields=files(id,name,modifiedTime)&pageSize=1&q=trashed=false&orderBy=modifiedTime desc"
    )

    // Calculate statistics
    const storageQuota = aboutData.storageQuota
    const totalStorageBytes = parseInt(storageQuota?.limit || "0")
    // Use usageInDrive for actual storage used (excludes trash)
    const usedStorageBytes = parseInt(storageQuota?.usageInDrive || storageQuota?.usage || "0")
    const usedStorageGB = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(2)
    const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2)

    // Debug logging for storage calculation
    console.log("Storage Quota Debug:", {
      limit: storageQuota?.limit,
      usage: storageQuota?.usage,
      usageInDrive: storageQuota?.usageInDrive,
      usageInDriveTrash: storageQuota?.usageInDriveTrash,
      totalStorageGB,
      usedStorageGB
    })

    // Get accurate total count of all items (files + folders)
    const totalFiles = await getAllItemsCount()
    const recentUploads = recentFilesData.files?.length || 0
    
    // Get last activity
    const lastActivity = recentActivityData.files?.[0]?.modifiedTime 
      ? new Date(recentActivityData.files[0].modifiedTime).toLocaleDateString()
      : "No recent activity"

    const stats = {
      totalFiles: totalFiles.toString(),
      storageUsed: `${usedStorageGB} GB`,
      storageTotal: `${totalStorageGB} GB`,
      recentUploads: recentUploads.toString(),
      lastActivity: lastActivity,
      user: aboutData.user?.displayName || "User"
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching drive statistics:", error)
    return NextResponse.json({ 
      error: "Failed to fetch drive statistics. Please try again." 
    }, { status: 500 })
  }
}
