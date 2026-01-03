import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { markAllNotificationsRead } from "@/lib/db"

export async function POST() {
  try {
    const session = await getSession()
    if (!session.user || session.user.email !== "staboost.io@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminId = Number(session.user.id)
    const result = await markAllNotificationsRead(adminId)
    return NextResponse.json({ success: result })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
