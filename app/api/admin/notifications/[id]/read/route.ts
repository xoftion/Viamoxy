import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { markNotificationRead } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session.user || session.user.email !== "staboost.io@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await markNotificationRead(Number(id))
    return NextResponse.json({ success: result })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
