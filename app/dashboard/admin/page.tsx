import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, ShoppingCart, TrendingUp } from "lucide-react"
import { getAdminStats } from "@/app/actions/admin"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats?.totalBalance || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Platform-wide balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Use Link instead of <a> to prevent full page reloads */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/admin/users"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
          >
            <Users className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-muted-foreground">View and manage user accounts</p>
          </Link>
          <Link
            href="/dashboard/admin/deposits"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
          >
            <Wallet className="h-8 w-8 mb-2 text-green-600" />
            <h3 className="font-semibold">Pending Deposits</h3>
            <p className="text-sm text-muted-foreground">Approve or reject deposits</p>
          </Link>
          <Link
            href="/dashboard/admin/messages"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
          >
            <ShoppingCart className="h-8 w-8 mb-2 text-blue-600" />
            <h3 className="font-semibold">Support Messages</h3>
            <p className="text-sm text-muted-foreground">Reply to user inquiries</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
