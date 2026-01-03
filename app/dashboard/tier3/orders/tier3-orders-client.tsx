"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, RefreshCw, ShoppingCart } from "lucide-react"
import { getTier3OrdersAction, refillTier3OrderAction, cancelTier3OrderAction } from "@/app/actions/tier3"
import { toast } from "sonner"
import Link from "next/link"

interface Tier3Order {
  id: number
  service: string
  link: string
  quantity: number
  price: number
  status: string
  refill_status?: string
  liveStatus?: string
  current?: number
  remains?: number
  created_at: string
  provider_order_id?: string
}

export function Tier3OrdersClient() {
  const [orders, setOrders] = useState<Tier3Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioning, setActioning] = useState<{ [key: number]: boolean }>({})

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTier3OrdersAction()
      if (result.success) {
        setOrders(result.orders || [])
      } else {
        setError(result.error || "Failed to load orders")
        toast.error(result.error || "Failed to load orders")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleRefill = async (orderId: number, providerOrderId: string) => {
    if (!providerOrderId) {
      toast.error("Order ID not available")
      return
    }
    setActioning((prev) => ({ ...prev, [orderId]: true }))
    try {
      const result = await refillTier3OrderAction(orderId, providerOrderId)
      if (result.success) {
        toast.success("Refill initiated!")
        fetchOrders()
      } else {
        toast.error(result.error || "Refill failed")
      }
    } catch (err) {
      toast.error("Error refilling order")
    } finally {
      setActioning((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const handleCancel = async (orderId: number, providerOrderId: string) => {
    if (!providerOrderId) {
      toast.error("Order ID not available")
      return
    }
    if (!confirm("Are you sure you want to cancel this order?")) return
    setActioning((prev) => ({ ...prev, [orderId]: true }))
    try {
      const result = await cancelTier3OrderAction(orderId, providerOrderId)
      if (result.success) {
        toast.success("Order cancelled!")
        fetchOrders()
      } else {
        toast.error(result.error || "Cancel failed")
      }
    } catch (err) {
      toast.error("Error cancelling order")
    } finally {
      setActioning((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tier 3 Orders</h1>
          <p className="text-muted-foreground">Premium orders history</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchOrders}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tier 3 Orders</h1>
          <p className="text-muted-foreground">Premium orders history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/dashboard/tier3/services">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
          </Link>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No orders yet. Browse services to place your first order.</p>
            <Link href="/dashboard/tier3/services">
              <Button className="bg-amber-600 hover:bg-amber-700">Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{order.service}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{order.link}</p>
                  </div>
                  <Badge className={getStatusColor(order.liveStatus || order.status)}>
                    {order.liveStatus || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-semibold">₦{order.price?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRefill(order.id, order.provider_order_id || "")}
                    disabled={actioning[order.id] || order.liveStatus === "completed"}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {actioning[order.id] ? <Loader2 className="mr-2 animate-spin" size={16} /> : "Refill"}
                  </Button>
                  <Button
                    onClick={() => handleCancel(order.id, order.provider_order_id || "")}
                    disabled={actioning[order.id] || order.liveStatus === "completed"}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    {actioning[order.id] ? <Loader2 className="mr-2 animate-spin" size={16} /> : "Cancel"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
