import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const API_BASE = "https://clientarea.getfollowed.com.ng/api/v3"
const API_KEY = process.env.GETFOLLOWED_API_KEY

interface GetFollowedService {
  service: string
  name: string
  type: string
  category: string
  rate: string
  min: number
  max: number
  dripfeed: number
  refill: number
  cancel: number
}

interface GetFollowedOrder {
  order: string
  status: string
  start_count: number
  current: number
  remains: number
  created_at: string
}

const NGN_USD_RATE = 1485

function getMarkupRate(ngnPrice: number): number {
  if (ngnPrice < 100) return 1.35
  if (ngnPrice < 500) return 1.25
  if (ngnPrice < 1000) return 0.9
  return 0.6
}

export async function getFollowedServices() {
  try {
    if (!API_KEY) {
      console.warn("[GetFollowed] API key not configured - server log only")
      return []
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=services`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Service fetch failed")

    const services = Object.values(data) as GetFollowedService[]
    return services.map((service) => {
      const providerRateUsd = Number.parseFloat(service.rate)
      const providerRateNgn = providerRateUsd * NGN_USD_RATE
      const markupMultiplier = 1 + getMarkupRate(providerRateNgn)
      const finalRate = Math.round((providerRateNgn * markupMultiplier) / 10) * 10
      return {
        id: service.service,
        name: service.name,
        category: service.category,
        rate: finalRate,
        min: service.min,
        max: service.max,
        dripfeed: service.dripfeed,
        refill: service.refill,
        cancel: service.cancel,
      }
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    return []
  }
}

export async function addGetFollowedOrder(
  service: string,
  link: string,
  quantity: number,
  runs?: number,
  interval?: number,
) {
  try {
    const params = new URLSearchParams({
      key: API_KEY!,
      action: "add",
      service,
      link,
      quantity: quantity.toString(),
    })

    if (runs) params.append("runs", runs.toString())
    if (interval) params.append("interval", interval.toString())

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await response.json()
    if (data.error) throw new Error("Order placement failed")

    return { orderId: data.order, charge: Number.parseFloat(data.charge) }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    throw new Error("Order could not be processed. Please try again.")
  }
}

export async function getFollowedOrderStatus(orders: string | string[]) {
  try {
    const orderList = Array.isArray(orders) ? orders.join(",") : orders
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=status&orders=${orderList}`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Status check failed")

    return data as Record<string, GetFollowedOrder>
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    throw new Error("Could not check order status. Please try again.")
  }
}

export async function getFollowedBalance() {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=balance`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Balance check failed")

    return Number.parseFloat(data.balance)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    return 0
  }
}

export async function refillGetFollowedOrder(order: string) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=refill&order=${order}`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Refill failed")

    return data
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    throw new Error("Refill request failed. Please try again.")
  }
}

export async function getFollowedRefillStatus(refill: string) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=refill_status&refill=${refill}`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Refill status check failed")

    return data
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    throw new Error("Could not check refill status.")
  }
}

export async function cancelGetFollowedOrder(order: string) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `key=${API_KEY}&action=cancel&order=${order}`,
    })

    const data = await response.json()
    if (data.error) throw new Error("Cancel failed")

    return data
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GetFollowed - Server Only]", errorMsg)
    throw new Error("Cancel request failed. Please try again.")
  }
}
