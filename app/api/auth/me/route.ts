import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { message: "No session found" },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Find user by session token (we'll need to add this field to User model)
    // For now, let's use a simple approach with user ID in the token
    try {
      const userId = JSON.parse(sessionToken).userId
      
      if (!userId) {
        return NextResponse.json(
          { message: "Invalid session" },
          { status: 401 }
        )
      }

      const user = await User.findById(userId)

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 401 }
        )
      }

      // Return user data without password
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      }

      return NextResponse.json(
        { 
          message: "Session valid", 
          user: userResponse 
        },
        { status: 200 }
      )

    } catch (parseError) {
      return NextResponse.json(
        { message: "Invalid session format" },
        { status: 401 }
      )
    }

  } catch (error: any) {
    console.error("Session check error:", error)
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
