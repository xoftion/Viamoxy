"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"

interface Notification {
  id: number
  notification_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_user_id?: number
  related_order_id?: number
}

export function NotificationClient({ notifications }: { notifications: Notification[] }) {
  const [notifs, setNotifs] = useState(notifications)

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, { method: "PATCH" })
      if (response.ok) {
        setNotifs(notifs.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      }
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, { method: "DELETE" })
      if (response.ok) {
        setNotifs(notifs.filter((n) => n.id !== notificationId))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      subscription: "bg-blue-50 border-blue-200",
      order: "bg-green-50 border-green-200",
      refund: "bg-red-50 border-red-200",
      user: "bg-purple-50 border-purple-200",
    }
    return colors[type] || "bg-gray-50 border-gray-200"
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      subscription: "🎟️",
      order: "📦",
      refund: "💰",
      user: "👤",
    }
    return icons[type] || "📢"
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">{unreadCount} unread</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No notifications yet</CardContent>
          </Card>
        ) : (
          notifs.map((notif) => (
            <Card key={notif.id} className={`border ${getNotificationColor(notif.notification_type)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="text-2xl">{getTypeIcon(notif.notification_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notif.title}</h3>
                        {!notif.is_read && <Badge className="bg-blue-600">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(notif.id)} title="Mark as read">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteNotification(notif.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
