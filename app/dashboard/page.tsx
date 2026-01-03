import { getSession } from "@/lib/session"
import { getActiveUsersCount } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ShoppingCart, CheckCircle, Clock, TrendingUp, ArrowUpRight, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`

function getDisplayOnlineUsers(isAdmin: boolean, realCount: number): number {
  if (isAdmin) {
    return realCount // Show real count to admin
  }
  // For regular users, show a fixed impressive number (2,800+) to build trust
  return 2800
}

export default async function DashboardPage() {
  const session = await getSession()
  const { user, orders } = session

  let onlineUsers = 2800 // Default for non-admin
  let realOnlineUsers = 0
  const isAdmin = user?.email === "staboost.io@gmail.com"

  if (isAdmin) {
    try {
      realOnlineUsers = await getActiveUsersCount()
      onlineUsers = realOnlineUsers
    } catch (error) {
      console.error("[v0] Failed to get real active users:", error)
      onlineUsers = 2800
    }
  }

  const completedOrders = orders.filter((o) => o.status === "completed").length
  const pendingOrders = orders.filter((o) => ["pending", "processing", "in_progress"].includes(o.status)).length
  const totalSpent = orders.reduce((sum, o) => sum + o.charge, 0)

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-primary">{user?.username}</span>!
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/add-funds">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Wallet size={18} />
              Add Funds
            </Button>
          </Link>
          <Link href="/dashboard/new-order">
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <ShoppingCart size={18} />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Balance"
          value={formatNaira(user?.balance || 0)}
          icon={Wallet}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20"
        />
        <StatCard
          title="Completed"
          value={completedOrders}
          icon={CheckCircle}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
        />
        <StatCard
          title="In Progress"
          value={pendingOrders}
          icon={Clock}
          className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp size={20} className="text-primary" />
              Spending Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="text-xl font-bold">{formatNaira(Math.round(totalSpent))}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Avg. Order Value</span>
                <span className="font-semibold">
                  {formatNaira(orders.length > 0 ? Math.round(totalSpent / orders.length) : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-bold text-primary text-lg">{formatNaira(user?.balance || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View All
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <Link href="/dashboard/new-order" className="text-sm text-primary hover:underline">
                  Place your first order
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{order.quantity.toLocaleString()} units</p>
                    </div>
                    <Badge
                      variant={order.status === "completed" ? "default" : "secondary"}
                      className={`ml-2 shrink-0 ${order.status === "completed" ? "bg-green-500" : ""}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Boost Your Social Presence</h3>
              <p className="text-sm text-muted-foreground">Get followers, likes, views and more at the best prices.</p>
            </div>
          </div>
          <Link href="/dashboard/new-order">
            <Button size="lg" className="shadow-lg shadow-primary/25">
              Start Growing Now
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Support Banner */}
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div>
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm text-muted-foreground">Our support team is available 24/7 to assist you.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/tickets">
              <Button variant="outline">Open Ticket</Button>
            </Link>
            <a href="mailto:staboost.io@gmail.com">
              <Button>Contact Support</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
