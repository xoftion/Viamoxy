import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session.user || session.user.email !== "staboost.io@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reply } = await request.json()
    const { id: messageId } = await params

    if (!reply || !reply.trim()) {
      return NextResponse.json({ error: "Reply cannot be empty" }, { status: 400 })
    }

    // Update the message with admin reply
    await sql`
      UPDATE live_chat_messages 
      SET admin_reply = ${reply.trim()}
      WHERE id = ${messageId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending admin reply:", error)
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
  }
}
