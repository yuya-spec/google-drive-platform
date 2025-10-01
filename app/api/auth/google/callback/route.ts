import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Get the base URL from the request or environment
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  console.log("Callback Configuration:", {
    baseUrl,
    redirectUri,
    code: code ? "✅ Present" : "❌ Missing",
    error: error || "None"
  })

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=access_denied", baseUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", baseUrl))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error || "Failed to exchange code for tokens")
    }

    // TODO: Store tokens securely (in database or session)
    // For now, we'll redirect with success
    const response = NextResponse.redirect(new URL("/dashboard/settings?success=connected", baseUrl))

    // Store tokens in cookies (in production, use a database)
    response.cookies.set("google_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expires_in,
    })

    if (tokens.refresh_token) {
      response.cookies.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return response
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    return NextResponse.redirect(new URL("/dashboard/settings?error=token_exchange_failed", baseUrl))
  }
}
