"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Lock } from "lucide-react"
import { purchaseTier2Action } from "@/app/actions/tier2"
import { toast } from "sonner"
import Link from "next/link"

interface Tier2ClientProps {
  userTier: number
  subscription: unknown
  balance: number
  isAdmin?: boolean
}

export function Tier2Client({ userTier, subscription, balance, isAdmin }: Tier2ClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const tierPrice = 3000

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const result = await purchaseTier2Action()
      if (result.success) {
        toast.success("Tier 2 subscription purchased!")
        router.refresh()
      } else {
        toast.error(result.error || "Purchase failed")
      }
    } catch (error) {
      toast.error("Error purchasing subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const hasTier1 = userTier >= 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tier 2 - Premium Services</h1>
        <p className="text-muted-foreground">Access premium services with advanced features (cumulative with Tier 1)</p>
        {isAdmin && <p className="text-sm text-blue-600 font-semibold mt-2">✓ Admin Account - Unlimited Free Access</p>}
      </div>

      {!hasTier1 && !isAdmin && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <strong>Tier 1 Required:</strong> You must unlock Tier 1 first before purchasing Tier 2.{" "}
            <Link href="/dashboard/tier1" className="underline font-semibold">
              Go to Tier 1
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {userTier !== 2 && userTier !== 3 && !isAdmin ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={24} />
              Unlock Tier 2
            </CardTitle>
            <CardDescription>Monthly subscription for Tier 2 premium services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">₦{tierPrice.toLocaleString()}/month</span>
                <CheckCircle className="text-green-600" />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  Access to premium services
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  Order refills and cancellations
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  5% profit margin pricing
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  Includes Tier 1 access
                </li>
              </ul>
            </div>

            {!hasTier1 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You must unlock Tier 1 first to access Tier 2.</AlertDescription>
              </Alert>
            ) : balance < tierPrice ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. Please add ₦{(tierPrice - balance).toLocaleString()} to your wallet.
                </AlertDescription>
              </Alert>
            ) : (
              <Button onClick={handlePurchase} disabled={isLoading} className="w-full gap-2">
                {isLoading ? "Processing..." : "Subscribe Now"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle size={24} />
              Tier 2 Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {isAdmin
                ? "Admin Account - Unlimited Lifetime Access"
                : `Subscription valid until ${(subscription as any)?.subscription_end ? new Date((subscription as any).subscription_end).toLocaleDateString() : "N/A"}`}
            </p>
            <Link href="/dashboard/tier2/services">
              <Button className="w-full">View Services</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
