"use server"

import { getSession } from "@/lib/session"
import {
  getUserWallet,
  deductWalletFunds,
  createTier1Subscription,
  activateTier1Subscription,
  getTier1Orders,
  createTier1Order,
  updateTier1OrderStatus,
  getAdminSetting,
  creditUserWallet,
  createTransaction,
} from "@/lib/db"
import { placeOrder, getOrderStatus } from "@/lib/cloutflash"
import { TRANSACTION_TAX_RATE } from "@/lib/pricing"
import type { ActionResult } from "@/lib/types"

async function getTier1Price(): Promise<number> {
  const price = await getAdminSetting("tier1_price")
  return price ? Number(price) : 1500
}

// =============================================================
// SUBSCRIPTION PURCHASE - NO TAX (flat admin-set fee)
// =============================================================
export async function purchaseTier1Action(): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const TIER1_PRICE = await getTier1Price() // No tax on subscription

    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < TIER1_PRICE) {
      return { success: false, error: "Insufficient balance" }
    }

    await deductWalletFunds(userId, TIER1_PRICE)

    const subscription = await createTier1Subscription(userId, TIER1_PRICE)
    if (!subscription) {
      return { success: false, error: "Failed to create subscription" }
    }

    const activated = await activateTier1Subscription(subscription.id)
    if (!activated.success) {
      return { success: false, error: "Failed to activate subscription" }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error purchasing Tier 1:", error)
    return { success: false, error: "Server error" }
  }
}

export async function getTier1PriceAction(): Promise<number> {
  return getTier1Price()
}

// =============================================================
// TIER 1 ORDER PLACEMENT - 3% TAX APPLIED
// =============================================================
export async function addTier1OrderAction(
  serviceId: number,
  serviceName: string,
  link: string,
  quantity: number,
  serviceRate: number, // API cost rate from provider (per 1000)
): Promise<
  ActionResult<{
    orderId: string
    price: number
    breakdown: { apiCost: number; profit: number; tax: number; total: number }
  }>
> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)

    // Get profit margin from admin settings
    const profitMarginSetting = await getAdminSetting("profit_margin")
    const profitMarginPercent = profitMarginSetting ? Number.parseFloat(profitMarginSetting) : 35

    // Calculate pricing with 3% tax
    const apiCost = Math.round((serviceRate / 1000) * quantity)
    const profitAmount = Math.round(apiCost * (profitMarginPercent / 100))
    const subtotal = apiCost + profitAmount
    const taxAmount = Math.round(subtotal * TRANSACTION_TAX_RATE) // 3% tax
    const finalPrice = subtotal + taxAmount

    // Check wallet balance
    const wallet = await getUserWallet(userId)
    if (!wallet || wallet.balance < finalPrice) {
      return {
        success: false,
        error: `Insufficient balance. You need ₦${finalPrice.toLocaleString()} but have ₦${wallet?.balance.toLocaleString() || 0}`,
      }
    }

    // Deduct from user wallet BEFORE API call
    await deductWalletFunds(userId, finalPrice)

    // Place order with API provider (hidden from user)
    let apiResponse
    try {
      apiResponse = await placeOrder(serviceId, link, quantity)
    } catch (apiError) {
      // API failed - refund user immediately
      console.error("[v0] Tier1 API order failed, refunding user:", apiError)
      await creditUserWallet(String(userId), finalPrice)
      await createTransaction(
        String(userId),
        "refund",
        finalPrice,
        `Refund: Tier1 order failed - ${serviceName}`,
        "completed",
      )
      return {
        success: false,
        error: "Order failed. Your balance has been refunded.",
      }
    }

    // Store order in database
    const dbOrder = await createTier1Order(
      userId,
      apiResponse.order?.toString() || "",
      serviceName,
      link,
      quantity,
      finalPrice,
      "pending",
    )

    // Record transaction
    await createTransaction(
      String(userId),
      "order",
      -finalPrice,
      `Tier1 Order: ${serviceName} (${quantity}) | Tax: ₦${taxAmount}`,
      "completed",
    )

    return {
      success: true,
      data: {
        orderId: dbOrder.id,
        price: finalPrice,
        breakdown: {
          apiCost,
          profit: profitAmount,
          tax: taxAmount,
          total: finalPrice,
        },
      },
    }
  } catch (error) {
    console.error("Error adding Tier 1 order:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

// =============================================================
// GET TIER 1 ORDERS
// =============================================================
export async function getTier1OrdersAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const userId = Number(session.user.id)
    const orders = await getTier1Orders(userId)

    // Enrich with live status from API provider
    for (const order of orders) {
      try {
        const providerOrderId = (order as any).provider_order_id || (order as any).api_order_id
        if (providerOrderId) {
          const status = await getOrderStatus(Number(providerOrderId))
          if (status) {
            Object.assign(order, {
              liveStatus: status.status,
              current: status.start_count,
              remains: status.remains,
            })
          }
        }
      } catch (err) {
        // Silent fail - keep existing order data
      }
    }

    return { success: true, data: orders }
  } catch (error) {
    console.error("Error getting Tier 1 orders:", error)
    return { success: false, error: "Failed to load orders" }
  }
}

// =============================================================
// CHECK TIER 1 ORDER STATUS
// =============================================================
export async function checkTier1OrderStatusAction(
  orderId: number,
  providerOrderId: string,
): Promise<ActionResult<{ status: string }>> {
  try {
    const session = await getSession()
    if (!session.user) return { success: false, error: "Not authenticated" }

    const status = await getOrderStatus(Number(providerOrderId))

    let orderStatus = "pending"
    switch (status.status?.toLowerCase()) {
      case "completed":
        orderStatus = "completed"
        break
      case "in progress":
      case "inprogress":
        orderStatus = "in_progress"
        break
      case "processing":
        orderStatus = "processing"
        break
      case "partial":
        orderStatus = "partial"
        break
      case "cancelled":
      case "canceled":
        orderStatus = "cancelled"
        break
      case "refunded":
        orderStatus = "refunded"
        break
      default:
        orderStatus = "pending"
    }

    await updateTier1OrderStatus(
      orderId,
      orderStatus,
      status.start_count ? Number(status.start_count) : undefined,
      status.remains ? Number(status.remains) : undefined,
    )

    return { success: true, data: { status: orderStatus } }
  } catch (error) {
    console.error("Error checking Tier 1 order status:", error)
    return { success: false, error: "Failed to check order status" }
  }
}
