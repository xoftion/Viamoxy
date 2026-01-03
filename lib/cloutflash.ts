import type { Service, CloutFlashOrder, CloutFlashStatus, CloutFlashBalance } from "./types"
import { getDisplayPricePerThousand, DEFAULT_PROFIT_MARGIN_PERCENT, DEFAULT_EXCHANGE_RATE } from "./pricing"

const API_URL = "https://app.cloutflash.com/api/v1"
const API_KEY = process.env.CLOUTFLASH_API_KEY || ""

export function applyMarkup(
  rate: string,
  serviceName = "",
  profitMarginPercent = DEFAULT_PROFIT_MARGIN_PERCENT,
): string {
  const displayPrice = getDisplayPricePerThousand(rate, profitMarginPercent)
  return displayPrice.toFixed(2)
}

export function getOriginalRate(providerRateUsd: string): string {
  return providerRateUsd
}

export function getNgnToUsd(ngnAmount: number): number {
  return ngnAmount / DEFAULT_EXCHANGE_RATE
}

export function calculateCostNgn(ratePerThousandNgn: number, quantity: number): number {
  return (ratePerThousandNgn / 1000) * quantity
}

async function apiRequest<T>(action: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!API_KEY) {
    console.error("[CloutFlash - Server Only] API key not configured")
    throw new Error("Service configuration error. Please contact support.")
  }

  const body = new URLSearchParams({
    key: API_KEY,
    action,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Service temporarily unavailable")
    }

    const data = await response.json()

    if (data.error) {
      console.error("[CloutFlash - Server Only] Operation failed")
      throw new Error("Unable to process request. Please try again.")
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes("Service")) {
      throw error
    }
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[CloutFlash - Server Only]", errorMsg)
    throw new Error("Service temporarily unavailable. Please try again.")
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const services = await apiRequest<Service[]>("services")
    return Array.isArray(services) ? services : []
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[CloutFlash - Server Only]", errorMsg)
    return []
  }
}

export async function placeOrder(serviceId: number, link: string, quantity: number): Promise<CloutFlashOrder> {
  return apiRequest<CloutFlashOrder>("add", {
    service: serviceId,
    link,
    quantity,
  })
}

export async function getOrderStatus(orderId: number): Promise<CloutFlashStatus> {
  return apiRequest<CloutFlashStatus>("status", { order: orderId })
}

export async function getBalance(): Promise<CloutFlashBalance> {
  return apiRequest<CloutFlashBalance>("balance")
}

export async function getServicesWithMarkup(
  profitMarginPercent?: number,
): Promise<(Service & { markedUpRate: string; originalRate: string })[]> {
  const services = await getServices()
  return services.map((service) => ({
    ...service,
    markedUpRate: applyMarkup(service.rate, service.name, profitMarginPercent),
    originalRate: service.rate, // Keep original for backend calculation
  }))
}
