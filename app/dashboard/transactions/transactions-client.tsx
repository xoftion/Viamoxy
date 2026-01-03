"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  status: string
  reference: string | null
  createdAt: string
}

interface TransactionsClientProps {
  transactions: Transaction[]
}

const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  completed: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
}

export function TransactionsClient({ transactions }: TransactionsClientProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.reference?.toLowerCase().includes(search.toLowerCase()) ||
      txn.id.includes(search)
    const matchesType = typeFilter === "all" || txn.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalCredit = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDebit = transactions
    .filter((t) => t.type === "order" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

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
        <h1 className="text-2xl font-bold md:text-3xl">Transaction History</h1>
        <p className="text-muted-foreground">View all your payment and order transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{formatNaira(Math.round(totalCredit))}</p>
            <p className="text-sm text-muted-foreground">Total Deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{formatNaira(Math.round(totalDebit))}</p>
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
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {txn.type === "deposit" ? (
                            <ArrowUpCircle size={14} className="text-green-600" />
                          ) : (
                            <ArrowDownCircle size={14} className="text-red-600" />
                          )}
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <p className="truncate">{txn.description}</p>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${txn.type === "deposit" ? "text-green-600" : "text-red-600"}`}
                      >
                        {txn.type === "deposit" ? "+" : "-"}
                        {formatNaira(Math.round(txn.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${statusColors[txn.status] || ""}`}>
                          {statusIcons[txn.status]}
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{txn.reference || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(txn.createdAt)}</TableCell>
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
