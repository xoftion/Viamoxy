import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

interface ShopService {
  id: string
  name: string
  type: string
  category: string
  min: number
  max: number
  rate: number
  price: number
  refill: boolean
  cancel: boolean
  dripfeed?: boolean
  description?: string
}

interface ShopOrder {
  order: string
  status: string
  link: string
  service: number
  quantity: number
  quantity_remaining: number
  charge: number
  start_count: number
  current_count: number
  drop_count: number
  refund_count: number
  created_at: number
}

const USD_TO_NGN = 1485
const API_BASE = process.env.SHOPRIME_API_URL || "https://shoprime.ng/api/v2"

function getMarkupRate(ngnPrice: number): number {
  if (ngnPrice < 100) return 1.35
  if (ngnPrice < 500) return 1.25
  if (ngnPrice < 1000) return 0.9
  return 0.6
}

const PREMIUM_SERVICES = ["CAC", "Graphics", "Music PR", "Newspaper", "article", "news"]

export async function getShopServices(): Promise<ShopService[]> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) {
      console.warn("[Shoprime - Server Only] API key not configured")
      return []
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=services`,
      cache: "no-store",
    })

    if (!response.ok) throw new Error("Service fetch failed")
    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error("[Shoprime - Server Only] Unexpected response format")
      return []
    }

    return data.map((service: any) => {
      const providerRateUsd = Number.parseFloat(service.rate)
      const providerRateNgn = providerRateUsd * USD_TO_NGN
      const markupMultiplier = 1 + getMarkupRate(providerRateNgn)
      const finalPrice = Math.round((providerRateNgn * markupMultiplier) / 10) * 10

      return {
        id: String(service.service),
        name: service.name || "Unknown Service",
        type: service.type || "Default",
        category: service.category || "General",
        min: Number(service.min) || 1,
        max: Number(service.max) || 10000,
        rate: Number.parseFloat(service.rate) || 0,
        price: finalPrice,
        refill: service.refill === true || service.refill === "true",
        cancel: service.cancel === true || service.cancel === "true",
        dripfeed: service.dripfeed === true || service.dripfeed === "true",
        description: service.description,
      }
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return []
  }
}

export async function addShopOrder(
  link: string,
  service: number,
  quantity: number,
  runs?: number,
  interval?: number,
): Promise<{ order: string; charge: number } | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const params = new URLSearchParams({
      key: apiKey,
      action: "add",
      service: String(service),
      link,
      quantity: String(quantity),
    })

    if (runs) params.append("runs", String(runs))
    if (interval) params.append("interval", String(interval))

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    if (!response.ok) throw new Error("Order placement failed")
    const data = await response.json()

    if (data.order) {
      return { order: String(data.order), charge: Number.parseFloat(data.charge) || 0 }
    }
    return null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}

export async function getShopOrderStatus(orderId: string): Promise<ShopOrder | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=status&order=${orderId}`,
    })

    if (!response.ok) throw new Error("Status check failed")
    const data = await response.json()
    return data || null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}

export async function getShopBalance(): Promise<number | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=balance`,
    })

    if (!response.ok) throw new Error("Balance check failed")
    const data = await response.json()
    return data.balance ? Number.parseFloat(data.balance) : null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}

export async function refillShopOrder(orderId: string): Promise<{ refill: string } | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=refill&order=${orderId}`,
    })

    if (!response.ok) throw new Error("Refill failed")
    const data = await response.json()
    return data.refill ? { refill: String(data.refill) } : null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}

export async function getShopRefillStatus(refillId: string): Promise<any | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=refill_status&refill=${refillId}`,
    })

    if (!response.ok) throw new Error("Refill status check failed")
    return await response.json()
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}

export async function cancelShopOrder(orderId: string): Promise<{ cancelled: string } | null> {
  try {
    const apiKey = process.env.SHOPRIME_API_KEY
    if (!apiKey) throw new Error("API key not set")

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${apiKey}&action=cancel&orders=${orderId}`,
    })

    if (!response.ok) throw new Error("Cancel failed")
    const data = await response.json()
    return data.cancelled ? { cancelled: String(data.cancelled) } : null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Shoprime - Server Only]", errorMsg)
    return null
  }
}
