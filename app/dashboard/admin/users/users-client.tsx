"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Search, RefreshCw } from "lucide-react"
import { getAdminData, manualCreditAction } from "@/app/actions/admin"
import { toast } from "sonner"

export function UsersClient() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [creditAmount, setCreditAmount] = useState<Record<string, string>>({})

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getAdminData()
      setUsers(data.users || [])
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCredit = async (userId: string, email: string) => {
    const amount = Number(creditAmount[userId])
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }

    const result = await manualCreditAction(email, amount, "Admin manual credit")
    if (result.success) {
      toast.success(`Credited ₦${amount.toLocaleString()} to ${email}`)
      setCreditAmount((prev) => ({ ...prev, [userId]: "" }))
      fetchUsers()
    } else {
      toast.error(result.error || "Credit failed")
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} />
          Users Management
        </h2>
        <Button onClick={fetchUsers} variant="outline" size="sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search users by email or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.username}</span>
                      {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm font-semibold text-green-600">
                      Balance: ₦{(user.balance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={creditAmount[user.id] || ""}
                      onChange={(e) => setCreditAmount((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      className="w-24"
                    />
                    <Button size="sm" onClick={() => handleCredit(user.id, user.email)}>
                      Credit
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-8">No users found</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
