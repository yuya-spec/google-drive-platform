import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET() {
  try {
    await connectDB()
    
    const users = await User.find({}, { password: 0 }) // Exclude password field
    
    return NextResponse.json({
      count: users.length,
      users: users
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
