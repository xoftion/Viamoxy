"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkOrderStatusAction } from "@/app/actions/orders"
import { toast } from "sonner"
import type { Order } from "@/lib/types"

interface OrdersClientProps {
  orders: Order[]
}

const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  partial: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  processing: <Loader2 size={14} className="animate-spin" />,
  in_progress: <Loader2 size={14} className="animate-spin" />,
  completed: <CheckCircle size={14} />,
  partial: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
  refunded: <RefreshCw size={14} />,
}

export function OrdersClient({ orders: initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshingOrder, setRefreshingOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      order.link.toLowerCase().includes(search.toLowerCase()) ||
      order.id.includes(search)
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleRefreshStatus(order: Order) {
    if (!order.orderId) {
      toast.error("Cannot check status - no API order ID")
      return
    }

    setRefreshingOrder(order.id)
    try {
      const result = await checkOrderStatusAction(order.id, order.orderId)
      if (result.success) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: result.status! } : o)))
        toast.success("Status updated")
      } else {
        toast.error(result.error || "Failed to check status")
      }
    } catch {
      toast.error("Failed to check status")
    } finally {
      setRefreshingOrder(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Order History</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {/* Stats - Changed $ to ₦ */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{orders.filter((o) => o.status === "completed").length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => ["pending", "processing", "in_progress"].includes(o.status)).length}
            </p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">
              {formatNaira(Math.round(orders.reduce((sum, o) => sum + o.charge, 0)))}
            </p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table - Changed $ to ₦ */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Charge</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate font-medium">{order.serviceName}</p>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 truncate text-primary hover:underline"
                        >
                          {order.link.slice(0, 30)}...
                          <ExternalLink size={12} />
                        </a>
                      </TableCell>
                      <TableCell className="text-center">{order.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatNaira(Math.round(order.charge))}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${statusColors[order.status] || ""}`}>
                          {statusIcons[order.status]}
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRefreshStatus(order)}
                          disabled={refreshingOrder === order.id}
                        >
                          <RefreshCw size={14} className={refreshingOrder === order.id ? "animate-spin" : ""} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
