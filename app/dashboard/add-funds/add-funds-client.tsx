"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Landmark,
  Copy,
  CheckCircle,
  Bitcoin,
} from "lucide-react"
import { submitDepositRequest, submitCryptoDeposit } from "@/app/actions/wallet"
import { toast } from "sonner"
import type { WalletTransaction } from "@/lib/types"

interface AddFundsClientProps {
  balance: number
  transactions: WalletTransaction[]
  cryptoWallets: {
    usdt: string
    ton: string
  }
  bankDetails: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000]

const initialCryptoRates = {
  usdt: 1650,
  ton: 2000,
}

export function AddFundsClient({ balance, transactions, cryptoWallets, bankDetails }: AddFundsClientProps) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [cryptoType, setCryptoType] = useState<"usdt" | "ton">("usdt")
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [cryptoRates, setCryptoRates] = useState(initialCryptoRates)
  const [ratesLoading, setRatesLoading] = useState(true)

  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true)
      try {
        const response = await fetch("/api/crypto-rates?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        if (response.ok) {
          const rates = await response.json()
          setCryptoRates(rates)
        }
      } catch (error) {
        console.error("Failed to fetch crypto rates:", error)
      } finally {
        setRatesLoading(false)
      }
    }

    fetchRates()
    const interval = setInterval(fetchRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleBankSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountValue = Number.parseFloat(amount)

    if (isNaN(amountValue) || amountValue < 1000) {
      setError("Minimum deposit is ₦1,000")
      return
    }

    if (amountValue > 500000) {
      setError("Maximum deposit is ₦500,000")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await submitDepositRequest(amountValue)
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
        toast.success("Deposit request submitted! Awaiting admin confirmation.")
        setAmount("")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCryptoSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cryptoValue = Number.parseFloat(cryptoAmount)

    if (isNaN(cryptoValue) || cryptoValue <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const ngnValue = cryptoValue * cryptoRates[cryptoType]
    if (ngnValue < 1000) {
      setError(`Minimum deposit is ₦1,000 (${(1000 / cryptoRates[cryptoType]).toFixed(4)} ${cryptoType.toUpperCase()})`)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const walletAddress = cryptoType === "usdt" ? cryptoWallets.usdt : cryptoWallets.ton
      const result = await submitCryptoDeposit(cryptoType, cryptoValue, walletAddress, ngnValue)
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
        toast.success("Crypto deposit submitted! Awaiting confirmation.")
        setCryptoAmount("")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const cryptoToNgn = Number.parseFloat(cryptoAmount || "0") * cryptoRates[cryptoType]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Add Funds</h1>
        <p className="text-muted-foreground">Add money to your STABOOST wallet</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Funds Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-white/20 p-4">
                <Wallet size={32} />
              </div>
              <div>
                <p className="text-sm opacity-90">Current Balance</p>
                <p className="text-3xl font-bold">{formatNaira(balance)}</p>
              </div>
            </CardContent>
          </Card>

          {submitted ? (
            <Card className="border-2">
              <CardContent className="text-center py-12 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="font-semibold text-lg">Deposit Request Submitted!</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Your deposit request is pending. After payment confirmation, your wallet will be credited within 5-30
                  minutes during business hours.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="bank" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bank" className="gap-2">
                  <Landmark size={16} />
                  Bank Transfer
                </TabsTrigger>
                <TabsTrigger value="crypto" className="gap-2">
                  <Bitcoin size={16} />
                  Crypto
                </TabsTrigger>
              </TabsList>

              {/* Bank Transfer Tab */}
              <TabsContent value="bank">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="text-primary" size={24} />
                      Bank Transfer
                    </CardTitle>
                    <CardDescription>Transfer funds to our bank account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBankSubmit} className="space-y-6">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Bank Details Card - Now uses dynamic bankDetails from props */}
                      <Card className="bg-gradient-to-br from-muted/50 to-muted border-2 border-dashed">
                        <CardContent className="p-5 space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Landmark size={18} className="text-primary" />
                            Bank Transfer Details
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-muted-foreground">Bank:</span>
                              <span className="font-semibold text-lg">{bankDetails.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-muted-foreground">Account Name:</span>
                              <span className="font-semibold">{bankDetails.accountName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xl text-primary">
                                  {bankDetails.accountNumber}
                                </span>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={() => copyToClipboard(bankDetails.accountNumber, "bank")}
                                >
                                  {copied === "bank" ? (
                                    <CheckCircle size={14} className="text-green-500" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Amount */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Amount to Deposit (NGN)</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">
                            ₦
                          </span>
                          <Input
                            type="number"
                            placeholder="0"
                            min="1000"
                            max="500000"
                            step="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-10 text-xl h-14 font-semibold"
                            required
                          />
                        </div>

                        {/* Quick Amounts */}
                        <div className="flex flex-wrap gap-2">
                          {quickAmounts.map((amt) => (
                            <Button
                              key={amt}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAmount(amt.toString())}
                              className={amount === amt.toString() ? "border-primary bg-primary/10 text-primary" : ""}
                            >
                              ₦{amt.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full gap-2 h-12 text-base" disabled={isSubmitting || !amount}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />I Have Made the Transfer -{" "}
                            {formatNaira(Number.parseFloat(amount || "0"))}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Crypto Tab */}
              <TabsContent value="crypto">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bitcoin className="text-orange-500" size={24} />
                      Crypto Deposit
                    </CardTitle>
                    <CardDescription>Pay with USDT (TRC20) or TON</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCryptoSubmit} className="space-y-6">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Crypto Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Select Cryptocurrency</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={cryptoType === "usdt" ? "default" : "outline"}
                            className="h-16 flex-col gap-1"
                            onClick={() => setCryptoType("usdt")}
                          >
                            <span className="text-lg font-bold">USDT</span>
                            <span className="text-xs opacity-80">TRC20 Network</span>
                          </Button>
                          <Button
                            type="button"
                            variant={cryptoType === "ton" ? "default" : "outline"}
                            className="h-16 flex-col gap-1"
                            onClick={() => setCryptoType("ton")}
                          >
                            <span className="text-lg font-bold">TON</span>
                            <span className="text-xs opacity-80">Toncoin</span>
                          </Button>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {cryptoType === "usdt" ? "USDT (TRC20)" : "TON"} Wallet Address
                            </span>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              {cryptoType === "usdt" ? "TRC20 ONLY" : "TON Network"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-background p-3 rounded border font-mono break-all">
                              {cryptoType === "usdt" ? cryptoWallets.usdt : cryptoWallets.ton}
                            </code>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  cryptoType === "usdt" ? cryptoWallets.usdt : cryptoWallets.ton,
                                  "crypto",
                                )
                              }
                            >
                              {copied === "crypto" ? (
                                <CheckCircle size={14} className="text-green-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ratesLoading ? (
                              <span className="animate-pulse">Updating rates...</span>
                            ) : (
                              <>
                                Rate: 1 {cryptoType.toUpperCase()} = ₦{cryptoRates[cryptoType].toLocaleString()}{" "}
                                <span className="text-green-600">(Live)</span>
                              </>
                            )}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Crypto Amount */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Amount ({cryptoType.toUpperCase()})</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.0001"
                          min="0"
                          value={cryptoAmount}
                          onChange={(e) => setCryptoAmount(e.target.value)}
                          className="text-xl h-14 font-semibold"
                          required
                        />
                        {cryptoAmount && (
                          <p className="text-sm text-muted-foreground">
                            You will receive:{" "}
                            <span className="font-bold text-green-600">{formatNaira(cryptoToNgn)}</span>
                          </p>
                        )}
                      </div>

                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-sm">
                          <strong>Important:</strong> Send the exact amount to the wallet address above. Your wallet
                          will be credited after blockchain confirmation (10-30 minutes).
                        </AlertDescription>
                      </Alert>

                      <Button
                        type="submit"
                        className="w-full gap-2 h-12 text-base bg-orange-500 hover:bg-orange-600"
                        disabled={isSubmitting || !cryptoAmount}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Bitcoin size={20} />I Have Sent {cryptoAmount || "0"} {cryptoType.toUpperCase()}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            tx.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tx.type === "deposit" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "deposit" ? "+" : "-"}
                          {formatNaira(tx.amount)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            tx.status === "completed"
                              ? "text-green-600 border-green-300"
                              : tx.status === "pending"
                                ? "text-yellow-600 border-yellow-300"
                                : "text-red-600 border-red-300"
                          }`}
                        >
                          {tx.status === "pending" && <Clock size={10} className="mr-1" />}
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
