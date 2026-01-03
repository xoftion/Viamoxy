"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save, RefreshCw, AlertCircle } from "lucide-react"
import { getAdminData, updateSettingsAction, unlockAdminAccountAction } from "@/app/actions/admin"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsState {
  min_deposit: string
  max_deposit: string
  bank_name: string
  bank_account: string
  account_name: string
  tier1_price: string
  tier2_price: string
  tier3_price: string
  profit_margin: string
  usdt_wallet: string
  ton_wallet: string
  crypto_gas_fee_percent: string
  [key: string]: string
}

const DEFAULT_SETTINGS: SettingsState = {
  min_deposit: "500",
  max_deposit: "1000000",
  bank_name: "",
  bank_account: "",
  account_name: "",
  tier1_price: "1500",
  tier2_price: "3000",
  tier3_price: "5000",
  profit_margin: "35",
  usdt_wallet: "",
  ton_wallet: "",
  crypto_gas_fee_percent: "7",
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminData()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
        return
      }

      if (data.settings && typeof data.settings === "object") {
        let settingsObj: Record<string, string> = {}

        if (!Array.isArray(data.settings)) {
          // Already a flat object {key: value}
          settingsObj = data.settings as Record<string, string>
        } else {
          // Legacy array format - convert it
          ;(data.settings as any[]).forEach((s: any) => {
            if (s && s.key) {
              settingsObj[s.key] = s.value || ""
            } else if (s && s.setting_key) {
              settingsObj[s.setting_key] = s.setting_value || ""
            }
          })
        }

        // Merge with defaults to ensure all fields exist
        setSettings({ ...DEFAULT_SETTINGS, ...settingsObj })
      }
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Failed to load settings. Please refresh the page.")
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateSettingsAction(settings)
      if (result.success) {
        toast.success("Settings saved successfully! Changes will reflect immediately in all orders.")
        setHasUnsavedChanges(false)
      } else {
        toast.error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Error saving settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleUnlockAdmin = async () => {
    try {
      const result = await unlockAdminAccountAction()
      if (result.success) {
        toast.success(result.message || "Admin unlocked")
      } else {
        toast.error(result.error || "Failed to unlock")
      }
    } catch (error) {
      toast.error("Error unlocking admin account")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Platform Settings
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Platform Settings
          </h2>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchSettings} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={24} />
          Platform Settings
        </h2>
        <div className="flex gap-2">
          <Button onClick={fetchSettings} variant="outline" size="sm" disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
            Refresh
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You have unsaved changes. Click "Save Settings" to apply them.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment and deposit settings (updates in real-time after save)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Deposit (NGN)</Label>
              <Input
                type="number"
                value={settings.min_deposit}
                onChange={(e) => handleSettingChange("min_deposit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Deposit (NGN)</Label>
              <Input
                type="number"
                value={settings.max_deposit}
                onChange={(e) => handleSettingChange("max_deposit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={settings.bank_name}
                onChange={(e) => handleSettingChange("bank_name", e.target.value)}
                placeholder="e.g. Opay, GTBank, Access Bank"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={settings.bank_account}
                onChange={(e) => handleSettingChange("bank_account", e.target.value)}
                placeholder="e.g. 0123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={settings.account_name}
                onChange={(e) => handleSettingChange("account_name", e.target.value)}
                placeholder="e.g. STABOOST"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Tax Settings</CardTitle>
            <CardDescription>Tier prices and profit margin. Formula: (API Cost + Profit) + 3% Tax</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tier 1 Subscription Price (NGN)</Label>
              <Input
                type="number"
                value={settings.tier1_price}
                onChange={(e) => handleSettingChange("tier1_price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tier 2 Subscription Price (NGN)</Label>
              <Input
                type="number"
                value={settings.tier2_price}
                onChange={(e) => handleSettingChange("tier2_price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tier 3 Subscription Price (NGN)</Label>
              <Input
                type="number"
                value={settings.tier3_price}
                onChange={(e) => handleSettingChange("tier3_price", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Profit Margin (%)</Label>
              <Input
                type="number"
                value={settings.profit_margin}
                onChange={(e) => handleSettingChange("profit_margin", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Applied to API cost. Final price = (API Cost × (1 + Profit%)) × 1.03
              </p>
            </div>
            <div className="space-y-2">
              <Label>Transaction Tax (%)</Label>
              <Input type="number" value="3" disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Fixed 3% tax applied to all orders (non-configurable)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto Settings</CardTitle>
            <CardDescription>Cryptocurrency payment addresses (updates in real-time after save)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>USDT (TRC20) Wallet Address</Label>
              <Input
                value={settings.usdt_wallet}
                onChange={(e) => handleSettingChange("usdt_wallet", e.target.value)}
                placeholder="TRC20 wallet address"
              />
            </div>
            <div className="space-y-2">
              <Label>TON Wallet Address</Label>
              <Input
                value={settings.ton_wallet}
                onChange={(e) => handleSettingChange("ton_wallet", e.target.value)}
                placeholder="TON wallet address"
              />
            </div>
            <div className="space-y-2">
              <Label>Crypto Gas Fee (%)</Label>
              <Input
                type="number"
                value={settings.crypto_gas_fee_percent}
                onChange={(e) => handleSettingChange("crypto_gas_fee_percent", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Quick admin actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleUnlockAdmin} variant="outline" className="w-full bg-transparent">
              Unlock Admin Account (All Tiers)
            </Button>
            <p className="text-xs text-muted-foreground">
              This grants unlimited lifetime access to all tiers for the admin account.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} className="gap-2 shadow-lg" size="lg">
          <Save size={16} />
          {saving ? "Saving..." : hasUnsavedChanges ? "Save Settings *" : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
