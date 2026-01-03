"use server"

import { getSession } from "@/lib/session"
import {
  getUserWallet,
  deductWalletFunds,
  createTier3Subscription,
  activateTier3Subscription,
  getTier3Orders,
  createTier3Order,
  updateTier3OrderStatus,
  getUserTier,
  getAdminSetting,
  creditUserWallet,
  createTransaction,
} from "@/lib/db"
import { addShopOrder, getShopOrderStatus, refillShopOrder, cancelShopOrder } from "@/lib/shoprime"
import { TRANSACTION_TAX_RATE } from "@/lib/pricing"
import type { ActionResult } from "@/types"

async function getTier3Price(): Promise<number> {
  const price = await getAdminSetting("tier3_price")
  return price ? Number(price) : 5000
}

export async function purchaseTier3Action() {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const TIER3_PRICE = await getTier3Price()

    const currentTier = await getUserTier(userId)
    if (currentTier < 2) {
      return { success: false, error: "You must unlock Tier 2 first before purchasing Tier 3" }
    }

    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < TIER3_PRICE) {
      return { success: false, error: "Insufficient balance" }
    }

    await deductWalletFunds(userId, TIER3_PRICE)

    const subscription = await createTier3Subscription(userId, TIER3_PRICE)
    if (!subscription) {
      return { success: false, error: "Failed to create subscription" }
    }

    const activated = await activateTier3Subscription(subscription.id)
    if (!activated.success) {
      return { success: false, error: "Failed to activate subscription" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error purchasing Tier 3:", error)
    return { success: false, error: "Server error" }
  }
}

export async function getTier3PriceAction(): Promise<ActionResult<number>> {
  try {
    const price = await getTier3Price()
    return { success: true, data: price }
  } catch (error) {
    return { success: false, error: "Failed to get tier price" }
  }
}

export async function addTier3OrderAction(
  service: string,
  link: string,
  quantity: number,
  servicePrice: number, // API cost rate from provider
  runs?: number,
  interval?: number,
) {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)

    const profitMarginSetting = await getAdminSetting("profit_margin")
    const profitMarginPercent = profitMarginSetting ? Number.parseFloat(profitMarginSetting) : 35

    const apiCost = Math.round((servicePrice / 1000) * quantity)
    const profitAmount = Math.round(apiCost * (profitMarginPercent / 100))
    const subtotal = apiCost + profitAmount
    const taxAmount = Math.round(subtotal * TRANSACTION_TAX_RATE)
    const finalPrice = subtotal + taxAmount

    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < finalPrice) {
      return { success: false, error: `Insufficient balance. You need ₦${finalPrice.toLocaleString()}` }
    }

    await deductWalletFunds(userId, finalPrice)

    let orderResult
    try {
      orderResult = await addShopOrder(link, Number(service), quantity, runs, interval)
      if (!orderResult) {
        throw new Error("API returned null")
      }
    } catch (apiError) {
      console.error("[v0] Tier3 API order failed, refunding user:", apiError)
      await creditUserWallet(String(userId), finalPrice)
      await createTransaction(String(userId), "refund", finalPrice, `Refund: Tier3 order failed`, "completed")
      return { success: false, error: "Order failed. Your balance has been refunded." }
    }

    const dbOrder = await createTier3Order(userId, orderResult.order, service, link, quantity, finalPrice, "pending")

    return {
      success: true,
      orderId: dbOrder.id,
      price: finalPrice,
      breakdown: { apiCost, profit: profitAmount, tax: taxAmount, total: finalPrice },
    }
  } catch (error) {
    console.error("Error adding Tier 3 order:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

export async function getTier3OrdersAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const orders = await getTier3Orders(userId)

    for (const order of orders) {
      try {
        const status = await getShopOrderStatus((order as any).shoprime_order_id)
        if (status) {
          Object.assign(order, {
            provider_order_id: (order as any).shoprime_order_id,
            liveStatus: status.status,
            current: status.current_count,
            remains: status.quantity_remaining,
          })
        }
      } catch (err) {
        console.error("Error fetching status for order", err)
      }
    }

    return { success: true, data: orders }
  } catch (error) {
    console.error("Error getting Tier 3 orders:", error)
    return { success: false, error: "Failed to load orders" }
  }
}

export async function refillTier3OrderAction(
  orderId: number,
  providerOrderId: string,
): Promise<ActionResult<{ refillId: string }>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const result = await refillShopOrder(providerOrderId)

    if (result && result.refill) {
      await updateTier3OrderStatus(orderId, "refilling", result.refill)
      return { success: true, data: { refillId: result.refill } }
    }

    return { success: false, error: "Refill failed" }
  } catch (error) {
    console.error("Error refilling Tier 3 order:", error)
    return { success: false, error: "Refill request failed" }
  }
}

export async function cancelTier3OrderAction(orderId: number, providerOrderId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const result = await cancelShopOrder(providerOrderId)

    if (result && result.cancelled) {
      await updateTier3OrderStatus(orderId, "cancelled")
      return { success: true, data: undefined }
    }

    return { success: false, error: "Cancel failed" }
  } catch (error) {
    console.error("Error cancelling Tier 3 order:", error)
    return { success: false, error: "Cancel request failed" }
  }
}
