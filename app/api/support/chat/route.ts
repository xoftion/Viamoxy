import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createLiveChatMessage } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const message = formData.get("message") as string
    const file = formData.get("file") as File | null

    if (!message && !file) {
      return NextResponse.json({ error: "Message or file required" }, { status: 400 })
    }

    let imageUrl: string | undefined = undefined

    if (file) {
      // Store file URL (in production, upload to cloud storage like Vercel Blob)
      // For now, create a placeholder
      imageUrl = `/uploads/${file.name}`
    }

    const newMessage = await createLiveChatMessage(Number(session.user.id), message || "Screenshot", imageUrl)

    if (!newMessage) {
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
    }

    return NextResponse.json({
      id: newMessage.id,
      user_id: newMessage.user_id,
      message: newMessage.message,
      image_url: newMessage.image_url,
      created_at: newMessage.created_at,
      username: session.user.username || session.user.email,
      email: session.user.email,
    })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
