import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear the session cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error("Logout error:", error)
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
