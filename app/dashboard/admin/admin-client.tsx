"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bitcoin,
  Settings,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Bell,
  MessageCircle,
  Trash2,
  CheckCheck,
  Send,
  Reply,
} from "lucide-react"
import {
  getAdminData,
  approveDepositAction,
  rejectDepositAction,
  approveCryptoDepositAction,
  rejectCryptoDepositAction,
  manualCreditAction,
  updateSettingsAction,
} from "@/app/actions/admin"
import { toast } from "sonner"

interface PendingDeposit {
  id: string
  userId: string
  amount: number
  description: string
  reference: string
  createdAt: string
  username: string
  email: string
}

interface CryptoDeposit {
  id: string
  userId: string
  cryptoType: string
  cryptoAmount: number
  walletAddress: string
  ngnAmount: number
  status: string
  txHash: string | null
  createdAt: string
  username: string
  email: string
}

interface UserData {
  id: string
  email: string
  username: string
  balance: number
  isAdmin: boolean
  createdAt: string
}

interface OrderData {
  id: string
  userId: string
  serviceName: string
  link: string
  quantity: number
  amount: number
  status: string
  providerOrderId: string
  createdAt: string
  username: string
  email: string
}

interface ActivityLog {
  id: string
  username: string
  action: string
  details: string
  createdAt: string
  ipAddress: string
}

interface Notification {
  id: number
  notification_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  username?: string
  email?: string
}

interface ChatMessage {
  id: number
  user_id: number
  message: string
  image_url: string | null
  created_at: string
  username: string
  email: string
  admin_reply?: string
}

export function AdminClient() {
  const [activeTab, setActiveTab] = useState("deposits")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [apiWalletBalance, setApiWalletBalance] = useState(0)
  const [profitBalance, setProfitBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [isLowBalance, setIsLowBalance] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchData()
    fetchApiBalance()
    fetchNotifications()
    fetchChatMessages()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const result = await getAdminData()
      if (!result.error) {
        setData(result)
        setProfitBalance(Number.parseFloat(result.settings?.admin_profit_balance || "0"))
        setSettings(result.settings || {})
      }
    } catch (error) {
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  async function fetchApiBalance() {
    setBalanceLoading(true)
    try {
      const response = await fetch("/api/api-balance?t=" + Date.now(), { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setApiWalletBalance(data.balance)
        setIsLowBalance(data.isLow)
      }
    } catch (error) {
      console.error("Failed to fetch API balance:", error)
    } finally {
      setBalanceLoading(false)
    }
  }

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  async function fetchChatMessages() {
    try {
      const response = await fetch("/api/admin/chat-messages")
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error)
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/admin/notifications/mark-all-read", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  async function deleteNotification(notificationId: number) {
    try {
      await fetch(`/api/admin/notifications/${notificationId}`, { method: "DELETE" })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast.success("Notification deleted")
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  async function sendAdminReply(messageId: number) {
    if (!replyMessage.trim()) return

    setSendingReply(true)
    try {
      const response = await fetch(`/api/admin/chat-messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyMessage }),
      })

      if (response.ok) {
        toast.success("Reply sent successfully!")
        setReplyingTo(null)
        setReplyMessage("")
        fetchChatMessages() // Refresh messages
      } else {
        throw new Error("Failed to send reply")
      }
    } catch (error) {
      toast.error("Failed to send reply")
    } finally {
      setSendingReply(false)
    }
  }

  const handleApprove = async (deposit: any) => {
    const result = await approveDepositAction(deposit.id, deposit.userId, deposit.amount)
    if (result.success) {
      toast.success(`Approved ₦${deposit.amount.toLocaleString()} for ${deposit.username}`)
      fetchData()
    } else {
      toast.error(result.error || "Failed to approve")
    }
  }

  const handleReject = async (deposit: any) => {
    const result = await rejectDepositAction(deposit.id)
    if (result.success) {
      toast.success(`Rejected deposit for ${deposit.username}`)
      fetchData()
    } else {
      toast.error(result.error || "Failed to reject")
    }
  }

  const handleApproveCrypto = async (deposit: any) => {
    const gasFeePercent = Number.parseFloat(data.settings.crypto_gas_fee_percent || "7")
    const gasFee = (deposit.ngnAmount * gasFeePercent) / 100
    const creditAmount = deposit.ngnAmount - gasFee

    if (
      !confirm(
        `Approve ₦${deposit.ngnAmount.toLocaleString()} crypto deposit?\n\n` +
          `Gas Fee (${gasFeePercent}%): -₦${gasFee.toLocaleString()}\n` +
          `User Credit: ₦${creditAmount.toLocaleString()}\n` +
          `Profit: +₦${gasFee.toLocaleString()}`,
      )
    ) {
      return
    }

    const result = await approveCryptoDepositAction(deposit.id, deposit.userId, deposit.ngnAmount, "")

    if (result.success) {
      toast.success("Crypto deposit approved and credited!")
      fetchData()
    } else {
      toast.error(result.error || "Failed to approve")
    }
  }

  const handleRejectCrypto = async (deposit: any) => {
    const result = await rejectCryptoDepositAction(deposit.id)
    if (result.success) {
      toast.success(`Rejected crypto deposit for ${deposit.username}`)
      fetchData()
    } else {
      toast.error(result.error || "Failed to reject")
    }
  }

  const handleManualCredit = async () => {
    const result = await manualCreditAction("", Number.parseFloat(""), "")
    if (result.success) {
      toast.success(`Successfully credited ₦${Number.parseFloat("").toLocaleString()}`)
      fetchData()
    } else {
      toast.error("Failed to credit")
    }
  }

  const handleSaveSettings = async () => {
    const result = await updateSettingsAction(settings)
    if (result.success) {
      toast.success("Settings saved!")
    } else {
      toast.error("Failed to save settings")
    }
  }

  const totalUsers = data?.totalUsers || 0
  const totalBalance = data?.totalBalance || 0
  const orderStats = data?.orderStats || { totalOrders: 0, totalSpent: 0 }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "subscription":
        return "bg-green-100 text-green-800"
      case "order":
        return "bg-blue-100 text-blue-800"
      case "chat":
        return "bg-purple-100 text-purple-800"
      case "deposit":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, deposits, and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="relative bg-transparent"
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Low Balance Alert */}
      {isLowBalance && (
        <Alert variant="destructive" className="bg-red-50 border-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Low API Wallet Balance!</strong> Your CloutFlash API balance is ₦{apiWalletBalance.toLocaleString()}
            . Please top up to continue processing orders.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total User Balances</p>
                <p className="text-2xl font-bold">₦{totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Wallet</p>
                <p className="text-2xl font-bold">₦{profitBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${isLowBalance ? "from-red-500/10 to-red-600/5 border-red-500/20" : "from-amber-500/10 to-amber-600/5 border-amber-500/20"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isLowBalance ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                <ShoppingCart className={`h-5 w-5 ${isLowBalance ? "text-red-500" : "text-amber-500"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">API Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">₦{apiWalletBalance.toLocaleString()}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchApiBalance}
                    disabled={balanceLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw size={14} className={balanceLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
                {isLowBalance && <p className="text-xs text-red-500 mt-1">Low balance alert!</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="deposits" className="gap-1">
            <Clock size={14} />
            Bank ({data?.pendingDeposits?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="crypto" className="gap-1">
            <Bitcoin size={14} />
            Crypto ({data?.pendingCryptoDeposits?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell size={14} />
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1">
            <MessageCircle size={14} />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="manage">User Management</TabsTrigger>
          <TabsTrigger value="manual">Manual Credit</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1">
            <Settings size={14} />
            Settings
          </TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="tier-management">Tier Management</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Admin Notifications</CardTitle>
                <CardDescription>User activity alerts and system notifications</CardDescription>
              </div>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck size={14} className="mr-2" />
                  Mark All Read
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications yet</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
                          !notification.is_read ? "bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getNotificationTypeColor(notification.notification_type)}>
                              {notification.notification_type}
                            </Badge>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          {notification.username && (
                            <p className="text-xs text-muted-foreground">
                              User: {notification.username} ({notification.email})
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                              <CheckCircle size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Messages</CardTitle>
              <CardDescription>View and respond to user support messages</CardDescription>
            </CardHeader>
            <CardContent>
              {chatMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No chat messages yet</p>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="rounded-lg border p-4 space-y-3">
                        {/* User message */}
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold">{msg.username?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{msg.username}</span>
                              <span className="text-xs text-muted-foreground">{msg.email}</span>
                              <Badge variant="outline" className="text-xs">
                                User ID: {msg.user_id}
                              </Badge>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">{msg.message}</p>
                              {msg.image_url && (
                                <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={msg.image_url || "/placeholder.svg"}
                                    alt="Attached"
                                    className="max-w-xs rounded-lg mt-2 hover:opacity-80 transition-opacity"
                                  />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Admin reply if exists */}
                        {msg.admin_reply && (
                          <div className="ml-14 bg-primary/10 rounded-lg p-3 border-l-4 border-primary">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-primary text-white">Admin Reply</Badge>
                            </div>
                            <p className="text-sm">{msg.admin_reply}</p>
                          </div>
                        )}

                        {/* Reply input */}
                        {replyingTo === msg.id ? (
                          <div className="ml-14 space-y-2">
                            <Textarea
                              placeholder="Type your reply..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => sendAdminReply(msg.id)}
                                disabled={sendingReply || !replyMessage.trim()}
                              >
                                <Send size={14} className="mr-2" />
                                {sendingReply ? "Sending..." : "Send Reply"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyMessage("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-14">
                            <Button size="sm" variant="outline" onClick={() => setReplyingTo(msg.id)}>
                              <Reply size={14} className="mr-2" />
                              {msg.admin_reply ? "Edit Reply" : "Reply"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Deposits Tab */}
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bank Deposits</CardTitle>
              <CardDescription>Approve or reject bank transfer deposit requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : data?.pendingDeposits?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending bank deposits</p>
              ) : (
                <div className="space-y-4">
                  {data.pendingDeposits.map((deposit: any) => (
                    <div
                      key={deposit.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{deposit.username}</p>
                          <Badge variant="outline" className="text-xs">
                            ID: {deposit.userId}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{deposit.email}</p>
                        <p className="text-lg font-bold text-green-600">₦{deposit.amount.toLocaleString()}</p>
                        {deposit.reference && <p className="text-xs text-muted-foreground">Ref: {deposit.reference}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(deposit.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(deposit)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(deposit)}>
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crypto Deposits Tab */}
        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Pending Crypto Deposits</CardTitle>
              <CardDescription>
                Approve or reject crypto deposits. Gas fee ({settings.crypto_gas_fee_percent || 7}%) will be deducted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : data?.pendingCryptoDeposits?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending crypto deposits</p>
              ) : (
                <div className="space-y-4">
                  {data.pendingCryptoDeposits.map((deposit: any) => (
                    <div
                      key={deposit.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{deposit.username}</p>
                          <Badge className="bg-orange-500 text-white">{deposit.cryptoType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{deposit.email}</p>
                        <p className="font-mono text-xs break-all">{deposit.walletAddress}</p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Crypto Amount</p>
                            <p className="font-bold">
                              {deposit.cryptoAmount} {deposit.cryptoType}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">NGN Value</p>
                            <p className="font-bold text-green-600">₦{deposit.ngnAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(deposit.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveCrypto(deposit)}
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectCrypto(deposit)}>
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.users?.slice(0, 20).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₦{user.balance.toLocaleString()}</p>
                      {user.isAdmin && <Badge className="bg-amber-500">Admin</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View all orders placed by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.orders?.slice(0, 20).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{order.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.username} - Qty: {order.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{order.link}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₦{order.amount.toLocaleString()}</p>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>View user activity and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.activityLogs?.slice(0, 50).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.username || "System"} - {log.ipAddress}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search and manage users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by email or username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
                <div className="space-y-4">
                  {data?.users
                    ?.filter(
                      (user: any) =>
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()),
                    )
                    .slice(0, 10)
                    .map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Credit Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Credit</CardTitle>
              <CardDescription>Manually credit a user&apos;s wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Amount (NGN)</Label>
                <Input type="number" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input placeholder="Refund, bonus, etc." />
              </div>
              <Button onClick={handleManualCredit}>Credit Wallet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Crypto Gas Fee (%)</Label>
                <Input
                  type="number"
                  value={settings.crypto_gas_fee_percent || "7"}
                  onChange={(e) => setSettings({ ...settings, crypto_gas_fee_percent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Profit Margin (%)</Label>
                <Input
                  type="number"
                  value={settings.profit_margin_percent || "30"}
                  onChange={(e) => setSettings({ ...settings, profit_margin_percent: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>View all active tier subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Subscription management will show active Tier 1, 2, and 3 subscriptions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue and transaction analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Orders Value</p>
                  <p className="text-2xl font-bold">₦{orderStats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orderStats.totalOrders}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Profit Balance</p>
                  <p className="text-2xl font-bold text-green-600">₦{profitBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view platform reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Report generation feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Management Tab */}
        <TabsContent value="tier-management">
          <Card>
            <CardHeader>
              <CardTitle>Tier Management</CardTitle>
              <CardDescription>Manage user tier subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Tier management allows activating and extending user subscriptions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
