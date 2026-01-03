import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/db"
import Link from "next/link"
import { LayoutDashboard, Users, Wallet, ShoppingCart, Bell, MessageCircle, Settings } from "lucide-react"

export const dynamic = "force-dynamic"

const adminNavItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/deposits", label: "Deposits", icon: Wallet },
  { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/admin/messages", label: "Chat Messages", icon: MessageCircle },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session?.userId) {
    redirect("/login")
  }

  const user = await getUserById(session.userId)

  if (!user?.isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage your platform</p>
      </div>

      {/* Admin Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg border">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-background hover:shadow-sm"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  )
}
