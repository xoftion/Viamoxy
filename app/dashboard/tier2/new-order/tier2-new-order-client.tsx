"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"
import { getFollowedServices } from "@/lib/getfollowed"
import { addTier2OrderAction } from "@/app/actions/tier2"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  category: string
  rate: number
  min: number
  max: number
  dripfeed: number
  refill: number
  cancel: number
}

interface Tier2NewOrderClientProps {
  balance: number
}

export function Tier2NewOrderClient({ balance }: Tier2NewOrderClientProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState("")
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [runs, setRuns] = useState<string>("")
  const [interval, setInterval] = useState<string>("")

  useEffect(() => {
    async function loadServices() {
      const data = await getFollowedServices()
      setServices(data)
      setLoading(false)
    }
    loadServices()
  }, [])

  const service = services.find((s) => s.id === selectedService)
  const estimatedCost = service ? service.rate * 1500 * quantity * 1.05 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !link) {
      toast.error("Please select a service and enter a link")
      return
    }

    if (estimatedCost > balance) {
      toast.error(`Insufficient balance. Need ₦${Math.ceil(estimatedCost)}, have ₦${balance}`)
      return
    }

    setSubmitting(true)
    const result = await addTier2OrderAction(
      service.id,
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
    } else {
      toast.error(result.error || "Failed to place order")
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Order</h1>
        <p className="text-muted-foreground">Select a service and place your order</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-bold">₦{balance.toLocaleString()}</p>
          </CardContent>
        </Card>
        {service && (
          <>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-3xl font-bold text-blue-600">₦{Math.ceil(estimatedCost).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Service Rate</p>
                <p className="text-3xl font-bold">₦{(service.rate * 1500).toLocaleString()}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Use correct links, no username changes, one order per link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading services...
                    </SelectItem>
                  ) : (
                    services.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        {svc.name} (₦{(svc.rate * 1500).toLocaleString()}/qty)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {service && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Min: {service.min} | Max: {service.max} | Refill: {service.refill === 1 ? "Yes" : "No"} | Cancel:{" "}
                    {service.cancel === 1 ? "Yes" : "No"}
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div>
              <Label>Link/Username</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://instagram.com/username"
                required
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={service?.min || 1}
                max={service?.max || 100000}
              />
            </div>

            {service?.dripfeed === 1 && (
              <>
                <div>
                  <Label>Runs (Optional)</Label>
                  <Input type="number" value={runs} onChange={(e) => setRuns(e.target.value)} placeholder="1" />
                </div>
                <div>
                  <Label>Interval in Hours (Optional)</Label>
                  <Input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </>
            )}

            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                Ensure your link is correct and public. Prices include 5% platform fee.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={submitting || loading || !selectedService} className="w-full">
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Place Order - ₦{Math.ceil(estimatedCost).toLocaleString()}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
