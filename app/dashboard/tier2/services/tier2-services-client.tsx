"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Search, Wallet, ShoppingCart, RefreshCw, XCircle } from "lucide-react"
import { addTier2OrderAction } from "@/app/actions/tier2"
import { toast } from "sonner"
import Link from "next/link"

interface Service {
  id: string
  name: string
  category: string
  rate: number // Now rate is NGN per 1K with margin included
  min: number
  max: number
  dripfeed: number
  refill: number
  cancel: number
}

interface Tier2ServicesClientProps {
  services: Service[]
  balance: number
}

export function Tier2ServicesClient({ services, balance }: Tier2ServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [runs, setRuns] = useState("")
  const [interval, setInterval] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredServices = useMemo(() => {
    if (!searchQuery) return services
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [services, searchQuery])

  const categories = useMemo(() => {
    return [...new Set(services.map((s) => s.category))]
  }, [services])

  const estimatedCost = selectedService ? (selectedService.rate / 1000) * quantity : 0
  const canAfford = estimatedCost <= balance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !link) {
      toast.error("Please select a service and enter a link")
      return
    }

    if (!canAfford) {
      toast.error(
        `Insufficient balance. Need ₦${Math.ceil(estimatedCost).toLocaleString()}, have ₦${balance.toLocaleString()}`,
      )
      return
    }

    setSubmitting(true)
    const result = await addTier2OrderAction(
      selectedService.id,
      link,
      quantity,
      runs ? Number(runs) : undefined,
      interval ? Number(interval) : undefined,
    )

    if (result.success) {
      toast.success(`Order placed! ID: ${result.orderId}`)
      setLink("")
      setQuantity(1)
      setRuns("")
      setInterval("")
      setSelectedService(null)
    } else {
      toast.error(result.error || "Failed to place order")
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Tier 2 Services</h1>
          <p className="text-muted-foreground">Browse and order premium services</p>
        </div>
        <div className="flex gap-3">
          <Card className="w-fit">
            <CardContent className="flex items-center gap-3 p-3">
              <Wallet size={20} className="text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-bold text-blue-600">₦{balance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Link href="/dashboard/tier2/orders">
            <Button variant="outline" className="h-full bg-transparent">
              <ShoppingCart size={16} className="mr-2" />
              My Orders
            </Button>
          </Link>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Ensure your link is correct and public. Prices include 5% platform fee.</AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>
                {services.length} services available across {categories.length} categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {filteredServices.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No services found</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(service)
                        setQuantity(service.min)
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedService?.id === service.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.category}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {service.refill === 1 && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <RefreshCw size={10} />
                                Refill
                              </Badge>
                            )}
                            {service.cancel === 1 && (
                              <Badge variant="outline" className="gap-1 text-xs">
                                <XCircle size={10} />
                                Cancel
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Min: {service.min.toLocaleString()} | Max: {service.max.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₦{service.rate.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">per 1K</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedService ? (
                  <>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium">{selectedService.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedService.category}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link">Link/Username</Label>
                      <Input
                        id="link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://instagram.com/username"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={selectedService.min}
                        max={selectedService.max}
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: {selectedService.min.toLocaleString()} - Max: {selectedService.max.toLocaleString()}
                      </p>
                    </div>

                    {selectedService.dripfeed === 1 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="runs">Runs (Optional)</Label>
                          <Input
                            id="runs"
                            type="number"
                            value={runs}
                            onChange={(e) => setRuns(e.target.value)}
                            placeholder="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interval">Interval in Hours (Optional)</Label>
                          <Input
                            id="interval"
                            type="number"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            placeholder="24"
                          />
                        </div>
                      </>
                    )}

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Estimated Cost</span>
                        <span className={`text-xl font-bold ${canAfford ? "text-blue-600" : "text-destructive"}`}>
                          ₦{Math.ceil(estimatedCost).toLocaleString()}
                        </span>
                      </div>
                      {!canAfford && <p className="mt-2 text-xs text-destructive">Insufficient balance.</p>}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={submitting || !canAfford || !link}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Place Order
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                    <p>Select a service to continue</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
