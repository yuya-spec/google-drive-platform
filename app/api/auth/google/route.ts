import { NextResponse } from "next/server"

export async function GET() {
  // Google OAuth configuration
  const clientId = process.env.GOOGLE_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000"
  const redirectUri = `${appUrl}/api/auth/google/callback`
  const scope = "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file"

  if (!clientId) {
    return NextResponse.json({ error: "Google Client ID not configured" }, { status: 500 })
  }

  console.log("OAuth Configuration:", {
    clientId: clientId ? "✅ Set" : "❌ Missing",
    appUrl,
    redirectUri,
    scope
  })

  // Build OAuth URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", clientId)
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", scope)
  authUrl.searchParams.append("access_type", "offline")
  authUrl.searchParams.append("prompt", "consent")

  return NextResponse.redirect(authUrl.toString())
}
