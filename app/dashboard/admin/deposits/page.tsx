"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Bitcoin, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import {
  getAdminData,
  approveDepositAction,
  rejectDepositAction,
  approveCryptoDepositAction,
  rejectCryptoDepositAction,
} from "@/app/actions/admin"
import { toast } from "sonner"

interface Deposit {
  id: string
  userId: string
  amount: number
  username: string
  email: string
  reference?: string
  createdAt?: string
  description?: string
}

interface CryptoDeposit {
  id: string
  userId: string
  cryptoType: string
  cryptoAmount: number
  ngnAmount: number
  status: string
  txHash?: string
  username: string
  walletAddress?: string
}

export default function AdminDepositsPage() {
  const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([])
  const [cryptoDeposits, setCryptoDeposits] = useState<CryptoDeposit[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchDeposits = async () => {
    setLoading(true)
    try {
      const data = await getAdminData()
      setPendingDeposits(data.pendingDeposits || [])
      setCryptoDeposits(data.pendingCryptoDeposits || [])
    } catch (error) {
      console.error("Error fetching deposits:", error)
      toast.error("Failed to load deposits")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const handleApprove = async (deposit: Deposit) => {
    setProcessingId(deposit.id)
    try {
      const result = await approveDepositAction(deposit.id, deposit.userId, deposit.amount)
      if (result.success) {
        toast.success(`Deposit of ₦${deposit.amount.toLocaleString()} approved for ${deposit.username}`)
        fetchDeposits()
      } else {
        toast.error(result.error || "Failed to approve")
      }
    } catch (error) {
      toast.error("Error approving deposit")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (deposit: Deposit) => {
    setProcessingId(deposit.id)
    try {
      const result = await rejectDepositAction(deposit.id)
      if (result.success) {
        toast.success("Deposit rejected")
        fetchDeposits()
      } else {
        toast.error(result.error || "Failed to reject")
      }
    } catch (error) {
      toast.error("Error rejecting deposit")
    } finally {
      setProcessingId(null)
    }
  }

  const handleApproveCrypto = async (deposit: CryptoDeposit) => {
    setProcessingId(deposit.id)
    try {
      const result = await approveCryptoDepositAction(deposit.id, deposit.userId, deposit.ngnAmount, deposit.txHash)
      if (result.success) {
        toast.success(`Crypto deposit of ₦${deposit.ngnAmount.toLocaleString()} approved`)
        fetchDeposits()
      } else {
        toast.error(result.error || "Failed to approve")
      }
    } catch (error) {
      toast.error("Error approving crypto deposit")
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectCrypto = async (deposit: CryptoDeposit) => {
    setProcessingId(deposit.id)
    try {
      const result = await rejectCryptoDepositAction(deposit.id)
      if (result.success) {
        toast.success("Crypto deposit rejected")
        fetchDeposits()
      } else {
        toast.error(result.error || "Failed to reject")
      }
    } catch (error) {
      toast.error("Error rejecting crypto deposit")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCryptoCount = cryptoDeposits.filter((d) => d.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wallet size={24} />
          Deposit Management
        </h2>
        <Button onClick={fetchDeposits} variant="outline" size="sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="bank">
        <TabsList>
          <TabsTrigger value="bank" className="gap-2">
            <Wallet size={16} />
            Bank Deposits ({pendingDeposits.length})
          </TabsTrigger>
          <TabsTrigger value="crypto" className="gap-2">
            <Bitcoin size={16} />
            Crypto Deposits ({pendingCryptoCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bank Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {pendingDeposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{deposit.username}</p>
                        <p className="text-sm text-muted-foreground">{deposit.email}</p>
                        <p className="font-semibold text-green-600">₦{deposit.amount.toLocaleString()}</p>
                        {deposit.reference && <p className="text-xs text-muted-foreground">Ref: {deposit.reference}</p>}
                        {deposit.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(deposit.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(deposit)} disabled={processingId === deposit.id}>
                          <CheckCircle size={16} className="mr-1" />
                          {processingId === deposit.id ? "Processing..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(deposit)}
                          disabled={processingId === deposit.id}
                        >
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingDeposits.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No pending bank deposits</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Crypto Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {cryptoDeposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{deposit.username}</p>
                          <Badge
                            variant={
                              deposit.status === "pending"
                                ? "secondary"
                                : deposit.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {deposit.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {deposit.cryptoType?.toUpperCase()} - {deposit.cryptoAmount}
                        </p>
                        <p className="font-semibold text-green-600">₦{deposit.ngnAmount?.toLocaleString()}</p>
                        {deposit.txHash && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">TX: {deposit.txHash}</p>
                        )}
                      </div>
                      {deposit.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveCrypto(deposit)}
                            disabled={processingId === deposit.id}
                          >
                            {processingId === deposit.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectCrypto(deposit)}
                            disabled={processingId === deposit.id}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {cryptoDeposits.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No crypto deposits</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
