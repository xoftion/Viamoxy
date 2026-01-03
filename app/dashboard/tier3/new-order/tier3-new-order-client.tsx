"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { getShopServices } from "@/lib/shoprime"
import { addTier3OrderAction } from "@/app/actions/tier3"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  min: number
  max: number
  price: number
  refill: boolean
  cancel: boolean
  dripfeed?: boolean
}

interface Tier3NewOrderClientProps {
  balance: number
}

export function Tier3NewOrderClient({ balance }: Tier3NewOrderClientProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getShopServices()
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const totalCost = selectedService ? selectedService.price * quantity : 0
  const canOrder =
    link && quantity >= selectedService?.min! && quantity <= selectedService?.max! && totalCost <= balance

  const handleSubmit = async () => {
    if (!selectedService) return

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
      <div>
        <h1 className="text-3xl font-bold">New Order</h1>
        <p className="text-muted-foreground">Select a service and place your order</p>
      </div>

      <div className="grid gap-4">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition ${
                      selectedService?.id === service.id
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                        : "border-border hover:border-amber-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Min: {service.min} • Max: {service.max}
                        </p>
                      </div>
                      <p className="font-bold">₦{service.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedService && (
          <>
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedService.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 dark:text-blue-200">
                    • Ensure link is correct and valid • No username changes allowed • One order per link •{" "}
                    {selectedService.dripfeed ? "Dripfeed supported" : ""}
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium">Link/Username</label>
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Enter profile link or username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number.parseInt(e.target.value) || 0))}
                    placeholder={`Min: ${selectedService.min}, Max: ${selectedService.max}`}
                    min={selectedService.min}
                    max={selectedService.max}
                    className="mt-1"
                  />
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit Price:</span>
                    <span>₦{selectedService.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span className="text-lg">₦{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Balance:</span>
                    <span className={balance >= totalCost ? "text-green-600" : "text-red-600"}>
                      ₦{balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {totalCost > balance && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance. Please add ₦{(totalCost - balance).toLocaleString()} to your wallet.
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
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
