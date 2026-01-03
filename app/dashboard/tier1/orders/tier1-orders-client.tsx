"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Trash2, Eye, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Tier1Order {
  id: number
  provider_order_id: string
  service: string
  link: string
  quantity: number
  price: number
  status: string
  refill_status: string | null
  created_at: string
  updated_at: string
}

interface Tier1OrdersClientProps {
  orders: Tier1Order[]
  balance: number
}

export function Tier1OrdersClient({ orders, balance }: Tier1OrdersClientProps) {
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800"
    if (status === "processing") return "bg-blue-100 text-blue-800"
    if (status === "cancelled") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Manage your Tier 1 service orders</p>
        </div>
        <Link href="/dashboard/tier1/services">
          <Button className="gap-2">
            <ShoppingCart size={16} />
            Browse Services
          </Button>
        </Link>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Use correct links only. Do not change usernames mid-order. One order per link.
        </AlertDescription>
      </Alert>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No orders yet. Browse services to place your first order.</p>
            <Link href="/dashboard/tier1/services">
              <Button>Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="text-sm font-medium">{order.service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-sm font-medium">{order.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={loadingOrderId === order.id}>
                      <Eye size={16} />
                    </Button>
                    {order.status !== "completed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingOrderId === order.id}
                          onClick={() => {
                            setLoadingOrderId(order.id)
                            toast.info("Refill initiated")
                            setLoadingOrderId(null)
                          }}
                        >
                          <RefreshCw size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={loadingOrderId === order.id}
                          onClick={() => {
                            setLoadingOrderId(order.id)
                            toast.info("Cancel initiated")
                            setLoadingOrderId(null)
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
