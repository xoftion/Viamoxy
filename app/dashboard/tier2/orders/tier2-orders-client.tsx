"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Loader, AlertCircle, CheckCircle2, Clock, ShoppingCart } from "lucide-react"
import { getTier2OrdersAction, refillTier2OrderAction, cancelTier2OrderAction } from "@/app/actions/tier2"
import { toast } from "sonner"
import Link from "next/link"

interface Tier2Order {
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

export function Tier2OrdersClient() {
  const [orders, setOrders] = useState<Tier2Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refilling, setRefilling] = useState<number | null>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTier2OrdersAction()
      if (result.success) {
        setOrders(result.orders || [])
      } else {
        setError(result.error || "Failed to load orders")
        toast.error(result.error || "Failed to load orders")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefill = async (orderId: number, providerOrderId: string) => {
    if (!providerOrderId) {
      toast.error("Order ID not available")
      return
    }
    setRefilling(orderId)
    try {
      const result = await refillTier2OrderAction(orderId, providerOrderId)
      if (result.success) {
        toast.success("Refill initiated")
        loadOrders()
      } else {
        toast.error(result.error || "Refill failed")
      }
    } catch (err) {
      toast.error("Failed to refill order")
    }
    setRefilling(null)
  }

  const handleCancel = async (orderId: number, providerOrderId: string) => {
    if (!providerOrderId) {
      toast.error("Order ID not available")
      return
    }
    if (!confirm("Are you sure you want to cancel this order?")) return
    setCancelling(orderId)
    try {
      const result = await cancelTier2OrderAction(orderId, providerOrderId)
      if (result.success) {
        toast.success("Order cancelled")
        loadOrders()
      } else {
        toast.error(result.error || "Cancel failed")
      }
    } catch (err) {
      toast.error("Failed to cancel order")
    }
    setCancelling(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tier 2 Orders</h1>
          <p className="text-muted-foreground">Premium Service Orders</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={loadOrders}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tier 2 Orders</h1>
          <p className="text-muted-foreground">Premium Service Orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadOrders} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/dashboard/tier2/services">
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
          </Link>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No orders yet. Browse services to place your first order.</p>
            <Link href="/dashboard/tier2/services">
              <Button>Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.liveStatus || order.status)}
                      {order.service}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{order.link}</p>
                  </div>
                  <div className="text-right">
                    <Badge>{order.liveStatus || order.status}</Badge>
                    <p className="text-sm font-semibold mt-2">₦{order.price?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remains</p>
                    <p className="font-semibold">{order.remains || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefill(order.id, order.provider_order_id || "")}
                    disabled={refilling === order.id || order.liveStatus === "completed"}
                  >
                    {refilling === order.id ? (
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Refill
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(order.id, order.provider_order_id || "")}
                    disabled={cancelling === order.id || order.liveStatus === "completed"}
                  >
                    {cancelling === order.id ? (
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    Cancel
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
