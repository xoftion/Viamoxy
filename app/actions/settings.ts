"use server"

import { getSession } from "@/lib/session"
import {
  createUserApiKey,
  revokeApiKey,
  createApiSubscription,
  getUserById,
  updateUserBalance,
  activateApiSubscription,
  createTransaction,
} from "@/lib/db"
import type { ActionResult } from "@/lib/types"

export async function generateApiKeyAction(): Promise<ActionResult<{ apiKey: string }>> {
  const session = await getSession()
  if (!session.user) {
    return { success: false, error: "Unauthorized" }
  }

  const apiKey = await createUserApiKey(String(session.user.id))
  if (!apiKey) {
    return { success: false, error: "Failed to generate API key" }
  }

  return { success: true, data: { apiKey } }
}

export async function revokeApiKeyAction(): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session.user) {
    return { success: false, error: "Unauthorized" }
  }

  const success = await revokeApiKey(String(session.user.id))
  if (!success) {
    return { success: false, error: "Failed to revoke API key" }
  }

  return { success: true, data: undefined }
}

export async function purchaseApiAccessAction(
  planType: "monthly" | "yearly" | "unlimited",
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session.user) {
    return { success: false, error: "Unauthorized" }
  }

  const userId = String(session.user.id)

  // Get user balance
  const user = await getUserById(userId)
  if (!user) {
    return { success: false, error: "User not found" }
  }

  // Plan pricing with VAT
  const pricing = {
    monthly: 5080,
    yearly: 50080,
    unlimited: 150080,
  }

  const amount = pricing[planType]

  if (user.balance < amount) {
    return { success: false, error: "Insufficient balance" }
  }

  try {
    // Deduct from user balance
    const newBalance = user.balance - amount
    await updateUserBalance(userId, newBalance)

    // Create subscription record
    const result = await createApiSubscription(userId, planType, amount)
    if (!result.success) {
      // Rollback balance
      await updateUserBalance(userId, user.balance)
      return { success: false, error: "Failed to create subscription" }
    }

    // Get the subscription ID and activate it
    const subscriptions = await import("@/lib/db").then((m) => m.getAllApiSubscriptions())
    const userSub = subscriptions.find((s: any) => s.user_id === Number.parseInt(userId) && s.status === "pending")

    if (userSub) {
      await activateApiSubscription(userSub.id)
    }

    // Create transaction record
    await createTransaction(userId, "api_purchase", -amount, `API ${planType} subscription purchase`, "completed")

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error purchasing API access:", error)
    return { success: false, error: "Purchase failed" }
  }
}
