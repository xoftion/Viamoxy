"use server"

import { getSession } from "@/lib/session"
import {
  getUserWallet,
  deductWalletFunds,
  createTier2Subscription,
  activateTier2Subscription,
  getTier2Orders,
  createTier2Order,
  updateTier2OrderStatus,
  getUserTier,
  getAdminSetting,
  creditUserWallet,
  createTransaction,
} from "@/lib/db"
import {
  addGetFollowedOrder,
  getFollowedOrderStatus,
  refillGetFollowedOrder,
  cancelGetFollowedOrder,
} from "@/lib/getfollowed"
import { TRANSACTION_TAX_RATE } from "@/lib/pricing"

const USD_TO_NGN = 1485

function getMarkupRate(ngnPrice: number): number {
  if (ngnPrice < 100) return 1.35
  if (ngnPrice < 500) return 1.25
  if (ngnPrice < 1000) return 0.9
  return 0.6
}

async function getTier2Price(): Promise<number> {
  const price = await getAdminSetting("tier2_price")
  return price ? Number(price) : 3000
}

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export async function purchaseTier2Action() {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const TIER2_PRICE = await getTier2Price()

    const currentTier = await getUserTier(userId)
    if (currentTier < 1) {
      return { success: false, error: "You must unlock Tier 1 first before purchasing Tier 2" }
    }

    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < TIER2_PRICE) {
      return { success: false, error: "Insufficient balance" }
    }

    await deductWalletFunds(userId, TIER2_PRICE)

    const subscription = await createTier2Subscription(userId, TIER2_PRICE)
    if (!subscription) {
      return { success: false, error: "Failed to create subscription" }
    }

    const activated = await activateTier2Subscription(subscription.id)
    if (!activated.success) {
      return { success: false, error: "Failed to activate subscription" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error purchasing Tier 2:", error)
    return { success: false, error: "Server error" }
  }
}

export async function getTier2PriceAction(): Promise<ActionResult<number>> {
  try {
    const price = await getTier2Price()
    return { success: true, data: price }
  } catch (error) {
    return { success: false, error: "Failed to get tier price" }
  }
}

export async function addTier2OrderAction(
  service: string,
  link: string,
  quantity: number,
  serviceRate: number, // API cost rate from provider
  runs?: number,
  interval?: number,
): Promise<ActionResult<{ orderId: number; price: number; breakdown: any }>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)

    const profitMarginSetting = await getAdminSetting("profit_margin")
    const profitMarginPercent = profitMarginSetting ? Number.parseFloat(profitMarginSetting) : 35

    const apiCost = Math.round((serviceRate / 1000) * quantity)
    const profitAmount = Math.round(apiCost * (profitMarginPercent / 100))
    const subtotal = apiCost + profitAmount
    const taxAmount = Math.round(subtotal * TRANSACTION_TAX_RATE)
    const finalPrice = subtotal + taxAmount

    // Check wallet balance FIRST
    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < finalPrice) {
      return { success: false, error: `Insufficient balance. You need ₦${finalPrice.toLocaleString()}` }
    }

    // Deduct BEFORE placing API order (prevents double-spending)
    await deductWalletFunds(userId, finalPrice)

    // Now place order with provider (hidden from user)
    let orderResult
    try {
      orderResult = await addGetFollowedOrder(service, link, quantity, runs, interval)
    } catch (apiError) {
      console.error("[v0] Tier2 API order failed, refunding user:", apiError)
      await creditUserWallet(String(userId), finalPrice)
      await createTransaction(String(userId), "refund", finalPrice, `Refund: Tier2 order failed`, "completed")
      return { success: false, error: "Order failed. Your balance has been refunded." }
    }

    // Store order in database
    const dbOrder = await createTier2Order(userId, orderResult.orderId, service, link, quantity, finalPrice, "pending")

    return {
      success: true,
      orderId: dbOrder.id,
      price: finalPrice,
      breakdown: { apiCost, profit: profitAmount, tax: taxAmount, total: finalPrice },
    }
  } catch (error) {
    console.error("Error adding Tier 2 order:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

export async function getTier2OrdersAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const orders = await getTier2Orders(userId)

    const orderIds = orders.map((o: any) => o.getfollowed_order_id).join(",")
    if (orderIds) {
      try {
        const statuses = await getFollowedOrderStatus(orderIds)
        const enrichedOrders = orders.map((order: any) => {
          const status = statuses[order.getfollowed_order_id]
          return {
            ...order,
            provider_order_id: order.getfollowed_order_id,
            liveStatus: status?.status || order.status,
            current: status?.current,
            remains: status?.remains,
          }
        })
        return { success: true, data: enrichedOrders }
      } catch {
        return { success: true, data: orders }
      }
    }

    return { success: true, data: orders }
  } catch (error) {
    console.error("Error getting Tier 2 orders:", error)
    return { success: false, error: "Failed to load orders" }
  }
}

export async function refillTier2OrderAction(
  orderId: number,
  providerOrderId: string,
): Promise<ActionResult<{ refillId: string }>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const result = await refillGetFollowedOrder(providerOrderId)

    if (result.refill) {
      await updateTier2OrderStatus(orderId, "refilling", result.refill)
      return { success: true, data: { refillId: result.refill } }
    }

    return { success: false, error: "Refill failed" }
  } catch (error) {
    console.error("Error refilling Tier 2 order:", error)
    return { success: false, error: "Refill request failed" }
  }
}

export async function cancelTier2OrderAction(orderId: number, providerOrderId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const result = await cancelGetFollowedOrder(providerOrderId)

    if (result.status) {
      await updateTier2OrderStatus(orderId, result.status)
      return { success: true, data: undefined }
    }

    return { success: false, error: "Cancel failed" }
  } catch (error) {
    console.error("Error cancelling Tier 2 order:", error)
    return { success: false, error: "Cancel request failed" }
  }
}
