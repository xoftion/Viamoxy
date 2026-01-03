import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createChatMessage, notifyAdminOnUserActivity } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, imageUrl } = await request.json()

    if (!message && !imageUrl) {
      return NextResponse.json({ error: "Message or image required" }, { status: 400 })
    }

    const userId = Number(session.user.id)
    const chatMessage = await createChatMessage(userId, message || "", imageUrl)

    if (!chatMessage) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    // Notify admin about new chat message
    await notifyAdminOnUserActivity(
      "chat",
      "New Support Message",
      `${session.user.username} sent a new support message: "${message?.substring(0, 50)}${message?.length > 50 ? "..." : ""}"`,
      userId,
    )

    return NextResponse.json({ message: chatMessage })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
