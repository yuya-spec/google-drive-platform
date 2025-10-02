import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Disconnected from Google Drive successfully" },
      { status: 200 }
    )

    // Clear the Google Drive authentication cookies
    response.cookies.set('google_access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    response.cookies.set('google_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error("Google Drive disconnect error:", error)
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
