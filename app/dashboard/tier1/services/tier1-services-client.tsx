"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Wallet,
  ChevronRight,
  Package,
  ShoppingCart,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Service {
  service: number
  name: string
  category: string
  rate: string
  min: string
  max: string
  refill?: boolean
  dripfeed?: boolean
  markedUpRate: string
}

interface Tier1ServicesClientProps {
  services: Service[]
  categories: string[]
  balance: number
}

export function Tier1ServicesClient({ services, categories, balance }: Tier1ServicesClientProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return []
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, searchQuery, selectedCategory])

  const totalCost = useMemo(() => {
    if (!selectedService || !quantity) return 0
    const rate = Number.parseFloat(selectedService.markedUpRate)
    const qty = Number.parseInt(quantity) || 0
    return (rate / 1000) * qty
  }, [selectedService, quantity])

  const canAfford = totalCost <= balance

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !link || !quantity) return

    setError(null)
    setIsSubmitting(true)

    try {
      // TODO: Implement actual order submission via server action
      toast.success("Order placed successfully!")
      setTimeout(() => {
        router.push("/dashboard/tier1/orders")
        router.refresh()
      }, 1000)
    } catch (err) {
      const errorMsg = "Failed to place order. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Tier 1 Services</h1>
          <p className="text-muted-foreground">Browse and order premium SMM services</p>
        </div>
        <div className="flex gap-3">
          <Card className="w-fit">
            <CardContent className="flex items-center gap-3 p-3">
              <Wallet size={20} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-bold text-primary">₦{balance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Link href="/dashboard/tier1/orders">
            <Button variant="outline" className="h-full bg-transparent">
              <ShoppingCart size={16} className="mr-2" />
              My Orders
            </Button>
          </Link>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Use verified links only. Do not change usernames. One order per link maximum.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCategory ? `${selectedCategory} Services` : "Select Category"}</CardTitle>
                  <CardDescription>
                    {selectedCategory ? "Choose a service from the list" : "Select a category to browse services"}
                  </CardDescription>
                </div>
                {selectedCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null)
                      setSelectedService(null)
                      setSearchQuery("")
                    }}
                  >
                    ← Back
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {categories.map((category) => {
                    const serviceCount = services.filter((s) => s.category === category).length
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className="group relative rounded-xl border-2 border-transparent bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg"
                      >
                        <div className="relative">
                          <div className="text-3xl">
                            <Package size={24} />
                          </div>
                          <h3 className="mt-2 font-semibold">{category}</h3>
                          <p className="text-xs text-muted-foreground">{serviceCount} services</p>
                          <ChevronRight
                            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100"
                            size={20}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${selectedCategory} services...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border p-2">
                    {filteredServices.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No services found</p>
                      </div>
                    ) : (
                      filteredServices.map((service) => (
                        <button
                          key={service.service}
                          type="button"
                          onClick={() => {
                            setSelectedService(service)
                            setQuantity(service.min)
                          }}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            selectedService?.service === service.service
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{service.name}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {service.refill && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <RefreshCw size={10} />
                                    Refill
                                  </Badge>
                                )}
                                {service.dripfeed && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <Clock size={10} />
                                    Drip
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Min: {Number(service.min).toLocaleString()} | Max:{" "}
                                {Number(service.max).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">₦{Number(service.markedUpRate).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">per 1K</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
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
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {selectedService ? (
                  <>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium">{selectedService.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedService.category}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link">Link</Label>
                      <Textarea
                        id="link"
                        placeholder="Enter the link (e.g., https://instagram.com/username)"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder={`Min: ${selectedService.min}`}
                        min={Number.parseInt(selectedService.min)}
                        max={Number.parseInt(selectedService.max)}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Min: {Number(selectedService.min).toLocaleString()} - Max:{" "}
                        {Number(selectedService.max).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Cost</span>
                        <span className={`text-xl font-bold ${canAfford ? "text-primary" : "text-destructive"}`}>
                          ₦{Math.round(totalCost).toLocaleString()}
                        </span>
                      </div>
                      {!canAfford && <p className="mt-2 text-xs text-destructive">Insufficient balance.</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSubmitting || !canAfford || !link || !quantity}
                    >
                      {isSubmitting ? (
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
                    <Package size={40} className="mx-auto mb-2 opacity-50" />
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
