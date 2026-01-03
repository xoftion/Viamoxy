"use server"

import { getSession } from "@/lib/session"
import {
  getUserById,
  getAllUsers,
  getAllPendingDeposits,
  approveDeposit,
  rejectDeposit,
  creditUserWallet,
  createTransaction,
  getPendingCryptoDeposits,
  approveCryptoDeposit,
  rejectCryptoDeposit,
  getAllAdminSettings,
  updateAdminSetting,
  getOrderStats,
  getAllOrders,
  activateTier1Subscription,
  activateTier2Subscription,
  activateTier3Subscription,
  sql,
  getRecentOrders,
} from "@/lib/db"
import { getUserByEmail } from "@/lib/db"
import type { ActionResult } from "@/lib/types"

// Check if current user is admin
async function isAdmin() {
  try {
    const session = await getSession()
    if (!session?.userId) return false

    const user = await getUserById(session.userId)
    return user?.isAdmin || false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function activateTierAction(userId: string, tier: 1 | 2 | 3): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    if (tier === 1) {
      await activateTier1Subscription(Number(userId))
    } else if (tier === 2) {
      await activateTier2Subscription(Number(userId))
    } else if (tier === 3) {
      await activateTier3Subscription(Number(userId))
    }

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Failed to activate tier" }
  }
}

export async function extendSubscriptionAction(userId: string): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const newEnd = new Date()
    newEnd.setMonth(newEnd.getMonth() + 1)

    await sql`
      UPDATE tier1_subscriptions 
      SET subscription_end = ${newEnd} 
      WHERE user_id = ${Number(userId)}
    `

    await sql`
      UPDATE tier2_subscriptions 
      SET subscription_end = ${newEnd} 
      WHERE user_id = ${Number(userId)}
    `

    await sql`
      UPDATE tier3_subscriptions 
      SET subscription_end = ${newEnd} 
      WHERE user_id = ${Number(userId)}
    `

    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Failed to extend subscription" }
  }
}

export async function unlockAdminAccountAction(): Promise<ActionResult<{ message: string }>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const admin = await getUserByEmail("staboost.io@gmail.com")
    if (!admin) {
      return { success: false, error: "Admin account not found" }
    }

    // Create and activate all tier subscriptions with no expiry
    await sql`
      INSERT INTO tier1_subscriptions (user_id, status, subscription_end) 
      VALUES (${Number(admin.id)}, 'active', NULL)
      ON CONFLICT DO NOTHING
    `

    await sql`
      INSERT INTO tier2_subscriptions (user_id, status, subscription_end) 
      VALUES (${Number(admin.id)}, 'active', NULL)
      ON CONFLICT DO NOTHING
    `

    await sql`
      INSERT INTO tier3_subscriptions (user_id, status, subscription_end) 
      VALUES (${Number(admin.id)}, 'active', NULL)
      ON CONFLICT DO NOTHING
    `

    await sql`
      INSERT INTO api_subscriptions (user_id, plan_type, status, expires_at)
      VALUES (${Number(admin.id)}, 'unlimited', 'active', NULL)
      ON CONFLICT DO NOTHING
    `

    await sql`
      UPDATE users SET tier = 3 WHERE id = ${Number(admin.id)}
    `

    return { success: true, data: { message: "Admin account unlocked with all tiers and subscriptions" } }
  } catch (error) {
    console.error("Error unlocking admin account:", error)
    return { success: false, error: "Failed to unlock admin account" }
  }
}

export async function getAdminData(): Promise<
  ActionResult<{
    users: any[]
    pendingDeposits: any[]
    pendingCryptoDeposits: any[]
    settings: Record<string, string>
    orderStats: any
    recentOrders: any[]
    totalUsers: number
    totalBalance: number
  }>
> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    let users: Awaited<ReturnType<typeof getAllUsers>> = []
    let pendingDeposits: Awaited<ReturnType<typeof getAllPendingDeposits>> = []
    let pendingCryptoDeposits: Awaited<ReturnType<typeof getPendingCryptoDeposits>> = []
    let settings: Awaited<ReturnType<typeof getAllAdminSettings>> = {}
    let orderStats: { total: number; pending: number; completed: number; cancelled: number } = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    }
    let recentOrders: Awaited<ReturnType<typeof getRecentOrders>> = []

    try {
      users = (await getAllUsers()) || []
    } catch (e) {
      console.error("Error fetching users:", e)
    }

    try {
      pendingDeposits = (await getAllPendingDeposits()) || []
    } catch (e) {
      console.error("Error fetching pending deposits:", e)
    }

    try {
      pendingCryptoDeposits = (await getPendingCryptoDeposits()) || []
    } catch (e) {
      console.error("Error fetching crypto deposits:", e)
    }

    try {
      settings = (await getAllAdminSettings()) || {}
    } catch (e) {
      console.error("Error fetching settings:", e)
    }

    try {
      orderStats = (await getOrderStats()) || { total: 0, pending: 0, completed: 0, cancelled: 0 }
    } catch (e) {
      console.error("Error fetching order stats:", e)
    }

    try {
      recentOrders = (await getRecentOrders()) || []
    } catch (e) {
      console.error("Error fetching orders:", e)
    }

    return {
      success: true,
      data: {
        users,
        pendingDeposits,
        pendingCryptoDeposits,
        settings,
        orderStats,
        recentOrders,
        totalUsers: users.length,
        totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
      },
    }
  } catch (error) {
    console.error("Error in getAdminData:", error)
    return {
      success: false,
      error: "Failed to fetch admin data",
    }
  }
}

export async function approveDepositAction(
  transactionId: string,
  userId: string,
  amount: number,
): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  const success = await approveDeposit(transactionId, userId, amount)

  if (success) {
    return { success: true, data: undefined }
  }

  return { success: false, error: "Failed to approve deposit" }
}

export async function rejectDepositAction(transactionId: string): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  const success = await rejectDeposit(transactionId)

  if (success) {
    return { success: true, data: undefined }
  }

  return { success: false, error: "Failed to reject deposit" }
}

export async function approveCryptoDepositAction(
  depositId: string,
  userId: string,
  ngnAmount: number,
  txHash?: string,
): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  const success = await approveCryptoDeposit(depositId, userId, ngnAmount, txHash)

  if (success) {
    return { success: true, data: undefined }
  }

  return { success: false, error: "Failed to approve crypto deposit" }
}

export async function rejectCryptoDepositAction(depositId: string, notes?: string): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  const success = await rejectCryptoDeposit(depositId, notes)

  if (success) {
    return { success: true, data: undefined }
  }

  return { success: false, error: "Failed to reject crypto deposit" }
}

export async function manualCreditAction(
  userId: string,
  amount: number,
  description: string,
): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  // Credit the wallet
  const success = await creditUserWallet(userId, amount)

  if (success) {
    // Create transaction record
    await createTransaction(userId, "deposit", amount, description, "completed", `ADMIN-${Date.now()}`)
    return { success: true, data: undefined }
  }

  return { success: false, error: "Failed to credit wallet" }
}

export async function updateSettingsAction(settings: Record<string, string>): Promise<ActionResult<void>> {
  if (!(await isAdmin())) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    for (const [key, value] of Object.entries(settings)) {
      await updateAdminSetting(key, value)
    }
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getAdminStats(): Promise<
  ActionResult<{
    totalUsers: number
    totalBalance: number
    totalOrders: number
    totalRevenue: number
  }>
> {
  try {
    if (!(await isAdmin())) {
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalBalance: 0,
          totalOrders: 0,
          totalRevenue: 0,
        },
      }
    }

    let users = []
    let orders = []
    let orderStats = { total: 0 }

    try {
      users = (await getAllUsers()) || []
    } catch (e) {
      console.error("Error fetching users for stats:", e)
    }

    try {
      orderStats = (await getOrderStats()) || { total: 0 }
    } catch (e) {
      console.error("Error fetching order stats:", e)
    }

    try {
      orders = (await getAllOrders()) || []
    } catch (e) {
      console.error("Error fetching orders:", e)
    }

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.charge || o.amount || 0), 0)

    return {
      success: true,
      data: {
        totalUsers: users.length,
        totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
        totalOrders: orderStats?.total || orders.length,
        totalRevenue,
      },
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    return {
      success: false,
      error: "Failed to fetch admin stats",
    }
  }
}

export { activateTierAction as activateTier, extendSubscriptionAction as extendSubscription }
