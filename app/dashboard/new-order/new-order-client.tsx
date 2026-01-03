"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Wallet,
  ChevronRight,
  Instagram,
  Music,
  Facebook,
  Play,
  Bird,
  Send,
  Headphones,
  LinkIcon,
  Package,
} from "lucide-react"
import { createOrderAction } from "@/app/actions/orders"
import { toast } from "sonner"
import type { Service } from "@/lib/types"

interface NewOrderClientProps {
  services: (Service & { markedUpRate: string; originalRate: string })[]
  categories: string[]
  balance: number
}

const formatNaira = (amount: number) => {
  return `₦${amount.toLocaleString()}`
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  Instagram: {
    icon: <Instagram size={24} />,
    color: "text-pink-600",
    bgColor: "bg-gradient-to-r from-pink-500 to-purple-500",
  },
  TikTok: { icon: <Music size={24} />, color: "text-black", bgColor: "bg-gradient-to-r from-gray-900 to-gray-700" },
  Facebook: {
    icon: <Facebook size={24} />,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-r from-blue-600 to-blue-400",
  },
  YouTube: { icon: <Play size={24} />, color: "text-red-600", bgColor: "bg-gradient-to-r from-red-600 to-red-400" },
  Twitter: { icon: <Bird size={24} />, color: "text-sky-500", bgColor: "bg-gradient-to-r from-sky-500 to-sky-400" },
  Telegram: { icon: <Send size={24} />, color: "text-blue-500", bgColor: "bg-gradient-to-r from-blue-500 to-cyan-400" },
  Spotify: {
    icon: <Headphones size={24} />,
    color: "text-green-500",
    bgColor: "bg-gradient-to-r from-green-600 to-green-400",
  },
  Threads: {
    icon: <LinkIcon size={24} />,
    color: "text-gray-800",
    bgColor: "bg-gradient-to-r from-gray-800 to-gray-600",
  },
  Other: { icon: <Package size={24} />, color: "text-gray-500", bgColor: "bg-gradient-to-r from-gray-500 to-gray-400" },
}

export function NewOrderClient({ services, categories, balance }: NewOrderClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselectedService = searchParams.get("service")

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<
    (Service & { markedUpRate: string; originalRate: string }) | null
  >(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (preselectedService) {
      const service = services.find((s) => s.service === Number.parseInt(preselectedService))
      if (service) {
        setSelectedCategory(service.category)
        setSelectedService(service)
        setQuantity(service.min)
      }
    }
  }, [preselectedService, services])

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
    return Math.round((rate / 1000) * qty * 100) / 100
  }, [selectedService, quantity])

  const canAfford = totalCost <= balance

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !link || !quantity) return

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createOrderAction(
        selectedService.service,
        selectedService.name,
        link,
        Number.parseInt(quantity),
        selectedService.originalRate,
      )

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Order placed successfully! Redirecting to orders page...")
        setTimeout(() => {
          router.push("/dashboard/orders")
          router.refresh()
        }, 1000)
      }
    } catch {
      const errorMsg = "Something went wrong. Please check your internet connection and try again."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedService(null)
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">New Order</h1>
          <p className="text-muted-foreground">Place a new order for SMM services</p>
        </div>
        <Card className="w-fit">
          <CardContent className="flex items-center gap-3 p-3">
            <Wallet size={20} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-bold text-primary">{formatNaira(balance)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCategory ? (
                      <span className="flex items-center gap-2">
                        {categoryConfig[selectedCategory]?.icon || <Package size={24} />}
                        {selectedCategory} Services
                      </span>
                    ) : (
                      "Select Category"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? "Choose a service from the list below"
                      : "Select a category to see available services"}
                  </CardDescription>
                </div>
                {selectedCategory && (
                  <Button variant="outline" size="sm" onClick={handleBackToCategories}>
                    ← Back
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {categories.map((category) => {
                    const config = categoryConfig[category] || categoryConfig.Other
                    const serviceCount = services.filter((s) => s.category === category).length
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg"
                      >
                        <div className={`absolute inset-0 opacity-10 ${config.bgColor}`} />
                        <div className="relative">
                          <div className={`text-3xl ${config.color}`}>{config.icon}</div>
                          <h3 className="mt-2 font-semibold">{category}</h3>
                          <p className="text-xs text-muted-foreground">{serviceCount} services</p>
                          <ChevronRight
                            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
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
                      <div className="py-8 text-center">
                        <AlertCircle className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No services found</p>
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
                              <p className="text-xs text-muted-foreground">per 1K (incl. tax)</p>
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

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total (incl. 3% tax)</span>
                        <span className={`text-xl font-bold ${canAfford ? "text-primary" : "text-destructive"}`}>
                          {formatNaira(Math.round(totalCost))}
                        </span>
                      </div>
                      {!canAfford && (
                        <p className="text-xs text-destructive">Insufficient balance. Please add funds.</p>
                      )}
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
                    <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                    <p>{selectedCategory ? "Select a service to continue" : "Select a category first"}</p>
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
