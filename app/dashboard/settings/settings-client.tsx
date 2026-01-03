"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Copy, RefreshCw, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { generateApiKeyAction, revokeApiKeyAction, purchaseApiAccessAction } from "@/app/actions/settings"

const API_PLANS = [
  {
    name: "Basic - Monthly",
    type: "monthly" as const,
    basePrice: 900,
    vat: 80,
    total: 980,
    period: "30 days",
    description: "Perfect for testing and small projects",
    tier: "basic",
  },
  {
    name: "Basic - Yearly",
    type: "yearly" as const,
    basePrice: 9000,
    vat: 80,
    total: 9080,
    period: "365 days",
    description: "Best value - 2 months free!",
    badge: "Popular",
    tier: "basic",
  },
  {
    name: "Tier 1 - Monthly",
    type: "monthly" as const,
    basePrice: 1500,
    vat: 80,
    total: 1580,
    period: "30 days",
    description: "Enhanced SMM Services",
    tier: "tier1",
  },
  {
    name: "Tier 1 - Yearly",
    type: "yearly" as const,
    basePrice: 15000,
    vat: 80,
    total: 15080,
    period: "365 days",
    description: "Best value annual subscription",
    badge: "Popular",
    tier: "tier1",
  },
  {
    name: "Tier 2 - Monthly",
    type: "monthly" as const,
    basePrice: 3000,
    vat: 80,
    total: 3080,
    period: "30 days",
    description: "Premium Services + Tier 1",
    tier: "tier2",
  },
  {
    name: "Tier 2 - Yearly",
    type: "yearly" as const,
    basePrice: 30000,
    vat: 80,
    total: 30080,
    period: "365 days",
    description: "Full Premium + Tier 1",
    tier: "tier2",
  },
  {
    name: "Tier 3 - Monthly",
    type: "monthly" as const,
    basePrice: 5000,
    vat: 80,
    total: 5080,
    period: "30 days",
    description: "All Premium Services + Tiers 1 & 2",
    tier: "tier3",
  },
  {
    name: "Tier 3 - Yearly",
    type: "yearly" as const,
    basePrice: 50000,
    vat: 80,
    total: 50080,
    period: "365 days",
    description: "Premium - Unlimited Access",
    badge: "Best Deal",
    tier: "tier3",
  },
]

export default function SettingsClient({
  user,
  initialApiKey,
  subscription,
}: {
  user: { id: string; email: string; username: string; balance: number }
  initialApiKey: string | null
  subscription: any
}) {
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()

  const isAdmin = user.email === "staboost.io@gmail.com"
  const hasActiveSubscription = isAdmin || (subscription && subscription.status === "active")

  const handlePurchase = async (plan: any) => {
    if (user.balance < plan.total) {
      alert(`Insufficient balance. You need ₦${plan.total.toLocaleString()} but have ₦${user.balance.toLocaleString()}`)
      return
    }

    if (!confirm(`Purchase ${plan.name} for ₦${plan.total.toLocaleString()}?`)) return

    setLoading(true)
    setSelectedPlan(plan.type)
    const result = await purchaseApiAccessAction(plan.type)
    if (result.success) {
      alert("API access purchased successfully!")
      router.refresh()
    } else {
      alert(result.error || "Purchase failed")
    }
    setLoading(false)
    setSelectedPlan(null)
  }

  const handleGenerateKey = async () => {
    if (!hasActiveSubscription) {
      alert("Please purchase an API subscription first")
      return
    }
    setLoading(true)
    const result = await generateApiKeyAction()
    if (result.success && result.apiKey) {
      setApiKey(result.apiKey)
    }
    setLoading(false)
  }

  const handleRevokeKey = async () => {
    if (!confirm("Are you sure you want to revoke your API key?")) return
    setLoading(true)
    const result = await revokeApiKeyAction()
    if (result.success) {
      setApiKey(null)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and API access</p>
        {isAdmin && (
          <p className="text-sm text-amber-600 font-semibold mt-2">✓ Admin Account - All API Plans Unlimited & Free</p>
        )}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={user.username} disabled />
          </div>
          <div>
            <Label>Wallet Balance</Label>
            <Input value={`₦${user.balance.toLocaleString()}`} disabled />
          </div>
        </div>
      </Card>

      {hasActiveSubscription && (
        <Card className="p-6 border-green-500/20 bg-green-500/5">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                {isAdmin ? "Admin Account - Unlimited API Access" : "Active API Subscription"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? "All API plans available at no cost - Lifetime access"
                  : `Plan: ${subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
                ${subscription.expires_at ? `| Expires: ${new Date(subscription.expires_at).toLocaleDateString()}` : ""}
                ${subscription.plan_type === "unlimited" ? "| Lifetime Access" : ""}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {!hasActiveSubscription && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Reseller API Access</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Purchase API access to integrate our services into your applications. All prices include 7.5% VAT (₦80).
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {API_PLANS.map((plan) => (
              <Card key={`${plan.tier}-${plan.type}`} className="p-4 relative overflow-hidden">
                {plan.badge && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-sm mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <p className="text-2xl font-bold">₦{plan.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                  <p>Base: ₦{plan.basePrice.toLocaleString()}</p>
                  <p>VAT: ₦{plan.vat}</p>
                </div>
                <Button
                  className="w-full text-sm"
                  onClick={() => handlePurchase(plan)}
                  disabled={loading || user.balance < plan.total}
                >
                  {loading && selectedPlan === plan.type ? <Clock className="h-4 w-4 animate-spin" /> : "Purchase"}
                </Button>
                {user.balance < plan.total && (
                  <p className="text-xs text-red-500 mt-2 text-center">Insufficient balance</p>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {hasActiveSubscription && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Key Management</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Generate an API key to integrate our services. Keep your key secure.
          </p>

          {apiKey ? (
            <div className="space-y-4">
              <div>
                <Label>Your API Key</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input value={apiKey} type={showKey ? "text" : "password"} readOnly className="pr-10" />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleRevokeKey} disabled={loading}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Revoke Key
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api-docs" target="_blank" rel="noreferrer">
                    View API Docs
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">Generate an API key to start integrating.</p>
              <Button onClick={handleGenerateKey} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate API Key
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
