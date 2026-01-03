"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ShoppingCart, RefreshCw, Search } from "lucide-react"
import { getAdminData } from "@/app/actions/admin"
import { toast } from "sonner"

export function OrdersClient() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getAdminData()
      setOrders(data.recentOrders || [])
    } catch (error) {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(
    (o) =>
      o.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.link?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-600"
      case "pending":
        return "bg-yellow-600"
      case "processing":
      case "in_progress":
        return "bg-blue-600"
      case "cancelled":
      case "failed":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart size={24} />
          Orders Management
        </h2>
        <Button onClick={fetchOrders} variant="outline" size="sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search orders by service, user, or link..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{order.serviceName || "Service"}</p>
                      <p className="text-sm text-muted-foreground">{order.username || "User"}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="ml-1 font-medium">{order.quantity?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-1 font-medium text-green-600">
                        ₦{(order.charge || order.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Link:</span>
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:underline truncate block"
                      >
                        {order.link?.substring(0, 50)}...
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(order.createdAt || order.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {filteredOrders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
