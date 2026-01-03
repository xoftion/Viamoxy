import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAllChatMessages } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session.user || session.user.email !== "staboost.io@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await getAllChatMessages()
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
