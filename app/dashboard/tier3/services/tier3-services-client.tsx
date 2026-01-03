"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Wallet,
  ShoppingCart,
  RefreshCw,
  XCircle,
  Package,
  ChevronRight,
} from "lucide-react"
import { addTier3OrderAction } from "@/app/actions/tier3"
import { toast } from "sonner"
import Link from "next/link"

interface Service {
  id: string
  name: string
  category: string
  min: number
  max: number
  price: number // Price is NGN per 1K with margin included
  refill: boolean
  cancel: boolean
  dripfeed?: boolean
}

interface Tier3ServicesClientProps {
  services: Service[]
  balance: number
}

export function Tier3ServicesClient({ services, balance }: Tier3ServicesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = useMemo(() => {
    return [...new Set(services.map((s) => s.category))]
  }, [services])

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return []
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, searchQuery, selectedCategory])

  const totalCost = selectedService ? (selectedService.price / 1000) * quantity : 0
  const canAfford = totalCost <= balance
  const canOrder =
    link &&
    quantity >= (selectedService?.min || 0) &&
    quantity <= (selectedService?.max || Number.POSITIVE_INFINITY) &&
    canAfford

  const handleSubmit = async () => {
    if (!selectedService || !canOrder) return

    setIsSubmitting(true)
    try {
      const result = await addTier3OrderAction(selectedService.id, link, quantity)
      if (result.success) {
        toast.success("Order placed successfully!")
        setLink("")
        setQuantity(0)
        setSelectedService(null)
      } else {
        toast.error(result.error || "Failed to place order")
      }
    } catch (error) {
      toast.error("Error placing order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl text-amber-600">Tier 3 Services</h1>
          <p className="text-muted-foreground">Browse and order premium professional services</p>
        </div>
        <div className="flex gap-3">
          <Card className="w-fit">
            <CardContent className="flex items-center gap-3 p-3">
              <Wallet size={20} className="text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-bold text-amber-600">₦{balance.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Link href="/dashboard/tier3/orders">
            <Button variant="outline" className="h-full bg-transparent">
              <ShoppingCart size={16} className="mr-2" />
              My Orders
            </Button>
          </Link>
        </div>
      </div>

      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Ensure link is correct and valid. No username changes allowed. One order per link.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCategory ? `${selectedCategory}` : "Select Category"}</CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? `${filteredServices.length} services available`
                      : `${services.length} services across ${categories.length} categories`}
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
                        className="group relative rounded-xl border-2 border-transparent bg-card p-4 text-left transition-all hover:border-amber-500 hover:shadow-lg"
                      >
                        <div className="relative">
                          <div className="text-3xl text-amber-600">
                            <Package size={24} />
                          </div>
                          <h3 className="mt-2 font-semibold text-sm">{category}</h3>
                          <p className="text-xs text-muted-foreground">{serviceCount} services</p>
                          <ChevronRight
                            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100 text-amber-600"
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
                              ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
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
                                {service.cancel && (
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
                              <p className="font-bold text-amber-600">₦{service.price.toLocaleString()}</p>
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
            <CardContent className="space-y-4">
              {selectedService ? (
                <>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200">
                    <p className="text-sm font-medium">{selectedService.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedService.category}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link/Username</Label>
                    <Input
                      id="link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Enter profile link or username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0, Number.parseInt(e.target.value) || 0))}
                      min={selectedService.min}
                      max={selectedService.max}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min: {selectedService.min.toLocaleString()} - Max: {selectedService.max.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rate per 1K:</span>
                      <span>₦{selectedService.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span>{quantity.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className={`text-lg ${canAfford ? "text-amber-600" : "text-destructive"}`}>
                        ₦{Math.ceil(totalCost).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!canAfford && totalCost > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Insufficient balance. Please add ₦{Math.ceil(totalCost - balance).toLocaleString()} to your
                        wallet.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!canOrder || isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={16} />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2" size={16} />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
