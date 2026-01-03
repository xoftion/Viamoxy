const API_URL = process.env.THEKCLAUT_API_URL || "https://thekclaut.com/api/v2"
const API_KEY = process.env.THEKCLAUT_API_KEY || ""

const NGN_USD_RATE = 1485

function getMarkupRate(ngnPrice: number): number {
  if (ngnPrice < 100) return 1.35
  if (ngnPrice < 500) return 1.25
  if (ngnPrice < 1000) return 0.9
  return 0.6
}

export interface ThekclautService {
  service: number
  name: string
  category: string
  rate: string
  min: string
  max: string
  refill?: boolean
  dripfeed?: boolean
  flags?: string[]
}

export interface ThekclautOrder {
  order: number
  status: string
  [key: string]: unknown
}

export interface ThekclautBalance {
  balance: number
  [key: string]: unknown
}

async function apiRequest<T>(action: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!API_KEY) {
    console.warn("[TheKclaut - Server Only] API key not configured")
    return null as unknown as T
  }

  const body = new URLSearchParams({
    key: API_KEY,
    action,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Request failed")
    }

    const data = await response.json()
    if (data.error) throw new Error("Operation failed")
    return data
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[TheKclaut - Server Only]", errorMsg)
    throw new Error("Service temporarily unavailable. Please try again.")
  }
}

export async function getServices(): Promise<ThekclautService[]> {
  try {
    const services = await apiRequest<ThekclautService[]>("services")
    return Array.isArray(services) ? services : []
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[TheKclaut - Server Only]", errorMsg)
    return []
  }
}

export async function addOrder(
  service: number,
  link: string,
  quantity: number,
  runs?: number,
  interval?: number,
): Promise<ThekclautOrder> {
  return apiRequest<ThekclautOrder>("add", {
    service,
    link,
    quantity,
    ...(runs && { runs }),
    ...(interval && { interval }),
  })
}

export async function getOrderStatus(orderId: number | string): Promise<ThekclautOrder> {
  return apiRequest<ThekclautOrder>("status", { order: orderId })
}

export async function getMultipleStatus(orders: string): Promise<Record<string, ThekclautOrder>> {
  return apiRequest<Record<string, ThekclautOrder>>("status", { orders })
}

export async function getBalance(): Promise<ThekclautBalance> {
  return apiRequest<ThekclautBalance>("balance")
}

export async function refillOrder(orderId: number | string): Promise<ThekclautOrder> {
  return apiRequest<ThekclautOrder>("refill", { order: orderId })
}

export async function refillMultiple(orders: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>("refill", { orders })
}

export async function cancelOrder(orders: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>("cancel", { orders })
}

export async function getServicesWithMarkup(): Promise<(ThekclautService & { markedUpRate: string })[]> {
  const services = await getServices()
  return services.map((service) => {
    const providerRateUsd = Number.parseFloat(service.rate)
    const providerRateNgn = providerRateUsd * NGN_USD_RATE
    const markupMultiplier = 1 + getMarkupRate(providerRateNgn)
    const finalRate = Math.round((providerRateNgn * markupMultiplier) / 10) * 10
    return {
      ...service,
      markedUpRate: finalRate.toFixed(2),
    }
  })
}

export function convertUsdToNgn(usdAmount: number): number {
  return Math.round(usdAmount * NGN_USD_RATE)
}

export function applyMarkup(ngnRate: number): number {
  const markupMultiplier = 1 + getMarkupRate(ngnRate)
  return Math.round((ngnRate * markupMultiplier) / 10) * 10
}
