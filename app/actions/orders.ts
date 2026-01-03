"use server"

import { getSession } from "@/lib/session"
import {
  createOrder,
  updateOrderStatus,
  createTransaction,
  atomicOrderTransaction,
  getApiWalletBalance,
  getAdminSetting,
  creditUserWallet,
} from "@/lib/db"
import { placeOrder, getOrderStatus } from "@/lib/cloutflash"
import { calculateFinalPrice, getApiCostNgn } from "@/lib/pricing"
import type { ActionResult } from "@/lib/types"

interface OrderResponse {
  orderId: string
  breakdown: {
    subtotal: number
    tax: number
    total: number
  }
}

export async function createOrderAction(
  serviceId: number,
  serviceName: string,
  link: string,
  quantity: number,
  providerRateUsd: string, // Original provider rate in USD
): Promise<ActionResult<OrderResponse>> {
  const session = await getSession()

  if (!session.user) {
    return { success: false, error: "You must be logged in to place an order" }
  }

  const profitMarginSetting = await getAdminSetting("profit_margin")
  const profitMarginPercent = profitMarginSetting ? Number.parseFloat(profitMarginSetting) : 35

  const apiCostPerThousandNgn = getApiCostNgn(providerRateUsd)

  const pricing = calculateFinalPrice(apiCostPerThousandNgn, quantity, profitMarginPercent)

  const totalUserCharge = pricing.finalPrice
  const apiCostNGN = pricing.apiCost
  const profitAmount = pricing.profitAmount + pricing.taxAmount // Profit includes tax revenue

  if (session.user.balance < totalUserCharge) {
    return {
      success: false,
      error: `Insufficient balance. You need ₦${totalUserCharge.toFixed(2)} but only have ₦${session.user.balance.toFixed(2)}. Please add funds to continue.`,
    }
  }

  const apiBalance = await getApiWalletBalance()
  if (apiBalance < apiCostNGN) {
    return {
      success: false,
      error:
        "Our service is temporarily unavailable due to system maintenance. Please try again in a few minutes or contact support for immediate assistance.",
    }
  }

  try {
    const txResult = await atomicOrderTransaction(session.user.id, totalUserCharge, apiCostNGN, profitAmount)

    if (!txResult.success) {
      return {
        success: false,
        error: txResult.error || "Transaction failed. Please contact support if the issue persists.",
      }
    }

    // Place order with API provider (hidden from user)
    let apiResponse
    try {
      apiResponse = await placeOrder(serviceId, link, quantity)
    } catch (apiError) {
      console.error("[v0] API order failed, initiating refund:", apiError)
      await creditUserWallet(session.user.id, totalUserCharge)
      await createTransaction(
        session.user.id,
        "refund",
        totalUserCharge,
        `Refund: Order failed - ${serviceName}`,
        "completed",
      )
      return {
        success: false,
        error: "Order could not be placed. Your balance has been refunded. Please try again or contact support.",
      }
    }

    // Create order in database (API provider info hidden)
    const order = await createOrder(
      session.user.id,
      serviceId.toString(),
      serviceName,
      link,
      quantity,
      totalUserCharge,
      apiResponse.order?.toString(),
    )

    if (!order) {
      return {
        success: false,
        error: "Order was placed but failed to save. Please contact support with your transaction details.",
      }
    }

    await createTransaction(
      session.user.id,
      "order",
      -totalUserCharge,
      `Order: ${serviceName} (${quantity}) | Tax: ₦${pricing.taxAmount.toFixed(2)}`,
    )

    return {
      success: true,
      data: {
        orderId: order.id,
        breakdown: {
          subtotal: pricing.subtotal,
          tax: pricing.taxAmount,
          total: pricing.finalPrice,
        },
      },
    }
  } catch (error) {
    console.error("Order failed:", error)
    return {
      success: false,
      error: "An error occurred while placing your order. Please try again or contact support if the problem persists.",
    }
  }
}

export async function checkOrderStatusAction(
  orderId: string,
  apiOrderId: string,
): Promise<ActionResult<{ status: string }>> {
  try {
    const status = await getOrderStatus(Number.parseInt(apiOrderId))

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

    await updateOrderStatus(
      orderId,
      orderStatus,
      status.start_count ? Number.parseInt(status.start_count) : undefined,
      status.remains ? Number.parseInt(status.remains) : undefined,
    )

    return { success: true, data: { status: orderStatus } }
  } catch (error) {
    console.error("Failed to check order status:", error)
    return { success: false, error: "Failed to check order status" }
  }
}
