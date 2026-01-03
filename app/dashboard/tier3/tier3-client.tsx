"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Lock } from "lucide-react"
import { purchaseTier3Action } from "@/app/actions/tier3"
import { toast } from "sonner"
import Link from "next/link"

interface Tier3ClientProps {
  userTier: number
  subscription: unknown
  balance: number
  isAdmin?: boolean
}

export function Tier3Client({ userTier, subscription, balance, isAdmin }: Tier3ClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const tierPrice = 5000

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const result = await purchaseTier3Action()
      if (result.success) {
        toast.success("Tier 3 subscription purchased!")
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

  const hasTier2 = userTier >= 2

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-600">Tier 3 - Premium & Professional Services</h1>
        <p className="text-muted-foreground">
          Access premium services (CAC, Graphics, PR, Newspapers) with advanced features (cumulative with Tier 1 & 2)
        </p>
        {isAdmin && (
          <p className="text-sm text-amber-600 font-semibold mt-2">✓ Admin Account - Unlimited Free Access</p>
        )}
      </div>

      {!hasTier2 && !isAdmin && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <strong>Tier 2 Required:</strong> You must unlock Tier 2 first before purchasing Tier 3.{" "}
            <Link href="/dashboard/tier2" className="underline font-semibold">
              Go to Tier 2
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {userTier !== 3 && !isAdmin ? (
        <Card className="border-amber-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Lock size={24} />
              Unlock Tier 3 Premium
            </CardTitle>
            <CardDescription>Monthly subscription for Tier 3 premium & professional services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">₦{tierPrice.toLocaleString()}/month</span>
                <CheckCircle className="text-amber-600" />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  Premium CAC & Business Registration
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  Graphics Design & Music PR Services
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  Newspaper & Article Publishing
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  5% profit margin on all services
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  Order refills and cancellations
                </li>
                <li className="flex gap-2">
                  <CheckCircle size={16} className="text-amber-600 flex-shrink-0" />
                  Includes Tier 1 & 2 access
                </li>
              </ul>
            </div>

            {!hasTier2 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You must unlock Tier 2 first to access Tier 3.</AlertDescription>
              </Alert>
            ) : balance < tierPrice ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. Please add ₦{(tierPrice - balance).toLocaleString()} to your wallet.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
              >
                {isLoading ? "Processing..." : "Subscribe Now"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <CheckCircle size={24} />
              Tier 3 Active - Premium Services Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {isAdmin
                ? "Admin Account - Unlimited Lifetime Access"
                : `Subscription valid until ${(subscription as any)?.subscription_end ? new Date((subscription as any).subscription_end).toLocaleDateString() : "N/A"}`}
            </p>
            <Link href="/dashboard/tier3/services">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">View Services</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
