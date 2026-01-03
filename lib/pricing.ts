// Pricing module for STABOOST services
// Formula: user_price = (API_cost_per_1k * exchange_rate) + profit_margin
// Then: tax = user_price * 0.03, final = user_price + tax

export const TRANSACTION_TAX_RATE = 0.03 // 3% transaction tax
export const DEFAULT_EXCHANGE_RATE = 1600 // USD to NGN
export const DEFAULT_PROFIT_MARGIN_PERCENT = 35 // 35% profit on API cost

export const pricelistData = {
  base: {
    services: [],
    rates: {},
  },
  tier1: {
    monthlyPrice: 5000, // NGN
    requestsPerMonth: 100,
    features: ["Basic service access", "Limited API requests"],
  },
  tier2: {
    monthlyPrice: 15000, // NGN
    requestsPerMonth: 500,
    features: ["Standard service access", "Standard API requests", "Email support"],
  },
  tier3: {
    monthlyPrice: 50000, // NGN
    requestsPerMonth: 5000,
    features: ["Premium service access", "Premium API requests", "24/7 priority support"],
  },
}

/**
 * Calculate the final price user pays for an order
 * Formula: (apiCostNgn + profit) * 1.03
 */
export function calculateFinalPrice(
  apiCostPerThousandNgn: number,
  quantity: number,
  profitMarginPercent = DEFAULT_PROFIT_MARGIN_PERCENT,
): {
  apiCost: number
  profitAmount: number
  subtotal: number
  taxAmount: number
  finalPrice: number
} {
  // API cost for the quantity
  const apiCost = (apiCostPerThousandNgn / 1000) * quantity

  // Profit margin on API cost
  const profitAmount = apiCost * (profitMarginPercent / 100)

  // Subtotal before tax
  const subtotal = apiCost + profitAmount

  // 3% transaction tax
  const taxAmount = subtotal * TRANSACTION_TAX_RATE

  // Final price user pays
  const finalPrice = subtotal + taxAmount

  return {
    apiCost: Math.round(apiCost * 100) / 100,
    profitAmount: Math.round(profitAmount * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  }
}

/**
 * Convert provider USD rate to NGN cost per 1K
 */
export function getApiCostNgn(providerRateUsd: string, exchangeRate = DEFAULT_EXCHANGE_RATE): number {
  const rateUsd = Number.parseFloat(providerRateUsd)
  return Math.round(rateUsd * exchangeRate * 100) / 100
}

/**
 * Calculate the display price per 1K for frontend (includes tax)
 * This ensures frontend shows the EXACT same price backend will charge
 */
export function getDisplayPricePerThousand(
  providerRateUsd: string,
  profitMarginPercent = DEFAULT_PROFIT_MARGIN_PERCENT,
  exchangeRate = DEFAULT_EXCHANGE_RATE,
): number {
  const apiCostNgn = getApiCostNgn(providerRateUsd, exchangeRate)
  const profitAmount = apiCostNgn * (profitMarginPercent / 100)
  const subtotal = apiCostNgn + profitAmount
  const withTax = subtotal * (1 + TRANSACTION_TAX_RATE)
  return Math.round(withTax * 100) / 100
}

/**
 * Get category for a service based on name
 */
export function getServiceCategory(serviceName: string): string {
  const nameLower = serviceName.toLowerCase()

  if (nameLower.includes("instagram")) return "Instagram"
  if (nameLower.includes("tiktok")) return "TikTok"
  if (nameLower.includes("facebook")) return "Facebook"
  if (nameLower.includes("youtube")) return "YouTube"
  if (nameLower.includes("twitter") || nameLower.includes("[x]")) return "Twitter"
  if (nameLower.includes("telegram")) return "Telegram"
  if (nameLower.includes("spotify")) return "Spotify"
  if (nameLower.includes("threads")) return "Threads"
  if (nameLower.includes("linkedin")) return "LinkedIn"
  if (nameLower.includes("discord")) return "Discord"
  if (nameLower.includes("twitch")) return "Twitch"
  if (nameLower.includes("soundcloud")) return "SoundCloud"

  return "Other"
}
