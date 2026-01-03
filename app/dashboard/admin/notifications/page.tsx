import { getAdminNotifications } from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { NotificationClient } from "./notification-client"

export default async function AdminNotificationsPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const isAdmin = session.user.email === "staboost.io@gmail.com"
  if (!isAdmin) {
    redirect("/dashboard")
  }

  let notifications: any[] = []
  try {
    notifications = await getAdminNotifications(Number(session.user.id))
  } catch (error) {
    console.error("Error fetching notifications:", error)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>
      <NotificationClient notifications={notifications} />
    </div>
  )
}
