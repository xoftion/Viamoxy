import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAdminNotifications, getUnreadNotificationCount } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()
    if (!session.user || session.user.email !== "staboost.io@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminId = Number(session.user.id)
    const notifications = await getAdminNotifications(adminId)
    const unreadCount = await getUnreadNotificationCount(adminId)

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
