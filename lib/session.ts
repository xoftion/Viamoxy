import { cookies } from "next/headers"
import {
  getUserById,
  getOrdersByUserId,
  getTransactionsByUserId,
  createActiveSession,
  updateActiveSessionActivity,
} from "./db"
import type { SessionData } from "./types"

const SESSION_COOKIE = "staboost_session"

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = `${userId}_${generateId()}`

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  createActiveSession(Number.parseInt(userId), sessionId, "0.0.0.0").catch(() => {})

  return sessionId
}

export async function getSession(): Promise<SessionData & { userId?: string }> {
  const emptySession = { user: null, orders: [], transactions: [] }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value

    // No session cookie - return empty (not an error)
    if (!sessionId) {
      return emptySession
    }

    const parts = sessionId.split("_")
    if (parts.length < 2) {
      console.error("[v0] Session: Invalid session format, clearing cookie")
      await clearInvalidSession()
      return emptySession
    }

    const userId = parts[0]

    // Validate userId is a valid number
    if (!userId || userId === "undefined" || userId === "null" || isNaN(Number(userId))) {
      console.error("[v0] Session: Invalid userId in session, clearing cookie")
      await clearInvalidSession()
      return emptySession
    }

    // Update session activity (non-blocking, don't wait)
    updateActiveSessionActivity(sessionId).catch(() => {})

    let user
    try {
      user = await getUserById(userId)
    } catch (dbError) {
      console.error("[v0] Session: Database error fetching user:", dbError)
      // Don't clear session on temporary DB errors - user might still be valid
      return emptySession
    }

    // User not found in database - clear the invalid session
    if (!user) {
      console.error("[v0] Session: User not found for ID:", userId)
      await clearInvalidSession()
      return emptySession
    }

    let orders = []
    let transactions = []

    try {
      orders = await getOrdersByUserId(userId)
    } catch (orderError) {
      console.error("[v0] Session: Error fetching orders:", orderError)
      orders = [] // Continue with empty orders rather than crashing
    }

    try {
      transactions = await getTransactionsByUserId(userId)
    } catch (txError) {
      console.error("[v0] Session: Error fetching transactions:", txError)
      transactions = [] // Continue with empty transactions rather than crashing
    }

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      orders: orders || [],
      transactions: transactions || [],
      userId,
    }
  } catch (error) {
    console.error("[v0] Session: Unexpected error in getSession:", error)
    return emptySession
  }
}

async function clearInvalidSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
  } catch (e) {
    // Ignore errors when clearing - might be in a context where we can't modify cookies
    console.error("[v0] Session: Could not clear invalid session cookie:", e)
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Re-export db functions for backwards compatibility
export {
  createUser,
  getUserByEmail,
  getUserById,
  verifyPassword,
  updateUserBalance,
  createOrder,
  updateOrderStatus,
  createTransaction,
} from "./db"
