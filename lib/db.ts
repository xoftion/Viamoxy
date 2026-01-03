import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export const sql = neon(process.env.DATABASE_URL!)

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support legacy hashes during migration (check format)
  if (hash.includes("_") && !hash.startsWith("$2")) {
    // Legacy hash format - migrate on next login
    return legacyVerifyPassword(password, hash)
  }
  return bcrypt.compare(password, hash)
}

// Legacy password verification for migration period
function legacyVerifyPassword(password: string, hash: string): boolean {
  let legacyHash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    legacyHash = (legacyHash << 5) - legacyHash + char
    legacyHash = legacyHash & legacyHash
  }
  return hash === legacyHash.toString(16) + "_" + password.length
}

export async function migratePasswordIfNeeded(userId: string, password: string, currentHash: string): Promise<void> {
  if (currentHash.includes("_") && !currentHash.startsWith("$2")) {
    const newHash = await hashPassword(password)
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${Number.parseInt(userId)}`
  }
}

export async function createUser(email: string, username: string, password: string) {
  try {
    const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`
    if (existingUser.length > 0) {
      return null // User already exists
    }

    const passwordHash = await hashPassword(password)
    const result = await sql`
      INSERT INTO users (email, username, password_hash, balance)
      VALUES (LOWER(${email}), ${username}, ${passwordHash}, 0)
      RETURNING id, email, username, balance, created_at
    `

    return {
      id: result[0].id.toString(),
      email: result[0].email,
      username: result[0].username,
      balance: Number.parseFloat(result[0].balance),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, username, password_hash, balance, is_admin, created_at 
      FROM users 
      WHERE LOWER(email) = LOWER(${email})
    `

    if (result.length === 0) return null

    return {
      id: result[0].id.toString(),
      email: result[0].email,
      username: result[0].username,
      password: result[0].password_hash,
      balance: Number.parseFloat(result[0].balance),
      isAdmin: result[0].is_admin || false, // Added admin flag
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT id, email, username, password_hash, balance, is_admin, created_at 
      FROM users 
      WHERE id = ${Number.parseInt(id)}
    `

    if (result.length === 0) return null

    return {
      id: result[0].id.toString(),
      email: result[0].email,
      username: result[0].username,
      password: result[0].password_hash,
      balance: Number.parseFloat(result[0].balance),
      isAdmin: result[0].is_admin || false, // Added admin flag
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error getting user by id:", error)
    return null
  }
}

export async function createOrder(
  userId: string,
  serviceId: string,
  serviceName: string,
  link: string,
  quantity: number,
  amount: number,
  providerOrderId?: string,
) {
  try {
    const result = await sql`
      INSERT INTO orders (user_id, service_id, service_name, link, quantity, amount, status, provider_order_id)
      VALUES (${Number.parseInt(userId)}, ${serviceId}, ${serviceName}, ${link}, ${quantity}, ${amount}, 'pending', ${providerOrderId || null})
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return null
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const result = await sql`
      SELECT id, service_id, service_name, link, quantity, amount, status, provider_order_id, created_at
      FROM orders 
      WHERE user_id = ${Number.parseInt(userId)}
      ORDER BY created_at DESC
    `

    return result.map((row) => ({
      id: row.id.toString(),
      orderId: row.provider_order_id,
      serviceId: row.service_id,
      serviceName: row.service_name,
      link: row.link,
      quantity: row.quantity,
      charge: Number.parseFloat(row.amount),
      status: row.status,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting orders:", error)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: string, startCount?: number, remains?: number) {
  try {
    await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${Number.parseInt(orderId)}
    `
    return true
  } catch (error) {
    console.error("Error updating order:", error)
    return false
  }
}

export async function createTransaction(
  userId: string,
  type: string,
  amount: number,
  description: string,
  status = "completed",
  reference?: string,
) {
  try {
    const result = await sql`
      INSERT INTO transactions (user_id, type, amount, description, status, reference)
      VALUES (${Number.parseInt(userId)}, ${type}, ${amount}, ${description}, ${status}, ${reference || null})
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function getTransactionsByUserId(userId: string) {
  try {
    const result = await sql`
      SELECT id, type, amount, description, status, reference, created_at
      FROM transactions 
      WHERE user_id = ${Number.parseInt(userId)}
      ORDER BY created_at DESC
    `

    return result.map((row) => ({
      id: row.id.toString(),
      type: row.type,
      amount: Number.parseFloat(row.amount),
      description: row.description,
      status: row.status,
      reference: row.reference,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting transactions:", error)
    return []
  }
}

export async function updateTransactionStatus(transactionId: string, status: string) {
  try {
    await sql`
      UPDATE transactions 
      SET status = ${status}
      WHERE id = ${Number.parseInt(transactionId)}
    `
    return true
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return false
  }
}

// Added function to update user balance
export async function updateUserBalance(userId: number, newBalance: number) {
  try {
    await sql`
      UPDATE users 
      SET balance = ${newBalance}, updated_at = NOW() 
      WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error("Error updating user balance:", error)
    return false
  }
}

export async function getPendingDeposits() {
  try {
    const result = await sql`
      SELECT t.id, t.user_id, t.amount, t.description, t.created_at, u.username, u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'deposit' AND t.status = 'pending'
      ORDER BY t.created_at DESC
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      amount: Number.parseFloat(row.amount),
      description: row.description,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting pending deposits:", error)
    return []
  }
}

export async function getTotalUsersCount() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error("Error getting users count:", error)
    return 0
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, username, balance, is_admin, created_at 
      FROM users 
      ORDER BY created_at DESC
    `
    return result.map((row) => ({
      id: row.id.toString(),
      email: row.email,
      username: row.username,
      balance: Number.parseFloat(row.balance),
      isAdmin: row.is_admin || false,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export async function creditUserWallet(userId: string, amount: number) {
  try {
    // Get current balance
    const user = await getUserById(userId)
    if (!user) return false

    const newBalance = user.balance + amount

    // Update balance
    await sql`
      UPDATE users 
      SET balance = ${newBalance}, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)}
    `

    return true
  } catch (error) {
    console.error("Error crediting user wallet:", error)
    return false
  }
}

export async function getAllPendingDeposits() {
  try {
    const result = await sql`
      SELECT t.id, t.user_id, t.amount, t.description, t.reference, t.created_at, u.username, u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'deposit' AND t.status = 'pending'
      ORDER BY t.created_at DESC
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      amount: Number.parseFloat(row.amount),
      description: row.description,
      reference: row.reference,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting pending deposits:", error)
    return []
  }
}

export async function approveDeposit(transactionId: string, userId: string, amount: number) {
  try {
    // Credit user wallet
    const credited = await creditUserWallet(userId, amount)
    if (!credited) return false

    // Update transaction status
    await sql`
      UPDATE transactions 
      SET status = 'completed'
      WHERE id = ${Number.parseInt(transactionId)}
    `

    return true
  } catch (error) {
    console.error("Error approving deposit:", error)
    return false
  }
}

export async function rejectDeposit(transactionId: string) {
  try {
    await sql`
      UPDATE transactions 
      SET status = 'rejected'
      WHERE id = ${Number.parseInt(transactionId)}
    `
    return true
  } catch (error) {
    console.error("Error rejecting deposit:", error)
    return false
  }
}

export async function createCryptoDeposit(
  userId: string,
  cryptoType: string,
  cryptoAmount: number,
  walletAddress: string,
  ngnAmount: number,
) {
  try {
    const result = await sql`
      INSERT INTO crypto_deposits (user_id, crypto_type, crypto_amount, wallet_address, ngn_amount, status)
      VALUES (${Number.parseInt(userId)}, ${cryptoType}, ${cryptoAmount}, ${walletAddress}, ${ngnAmount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating crypto deposit:", error)
    return null
  }
}

export async function getPendingCryptoDeposits() {
  try {
    const result = await sql`
      SELECT cd.id, cd.user_id, cd.crypto_type, cd.crypto_amount, cd.wallet_address, cd.ngn_amount, 
             cd.status, cd.tx_hash, cd.created_at, u.username, u.email
      FROM crypto_deposits cd
      JOIN users u ON cd.user_id = u.id
      WHERE cd.status = 'pending'
      ORDER BY cd.created_at DESC
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      cryptoType: row.crypto_type,
      cryptoAmount: Number.parseFloat(row.crypto_amount),
      walletAddress: row.wallet_address,
      ngnAmount: Number.parseFloat(row.ngn_amount),
      status: row.status,
      txHash: row.tx_hash,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting pending crypto deposits:", error)
    return []
  }
}

export async function approveCryptoDeposit(depositId: string, userId: string, ngnAmount: number, txHash?: string) {
  try {
    const gasFeePercentage = Number.parseFloat((await getAdminSetting("crypto_gas_fee_percent")) || "7")
    const gasFee = (ngnAmount * gasFeePercentage) / 100
    const creditAmount = ngnAmount - gasFee

    // Credit user wallet (minus gas fee)
    const credited = await creditUserWallet(userId, creditAmount)
    if (!credited) return false

    // Add gas fee to profit wallet
    await updateProfitBalance(gasFee)

    // Update deposit status
    await sql`
      UPDATE crypto_deposits 
      SET status = 'completed', tx_hash = ${txHash || null}, updated_at = NOW()
      WHERE id = ${Number.parseInt(depositId)}
    `

    // Create transaction record
    await createTransaction(
      userId,
      "deposit",
      creditAmount,
      `Crypto deposit approved (${gasFeePercentage}% gas fee deducted)`,
      "completed",
    )

    return true
  } catch (error) {
    console.error("Error approving crypto deposit:", error)
    return false
  }
}

export async function rejectCryptoDeposit(depositId: string, notes?: string) {
  try {
    await sql`
      UPDATE crypto_deposits 
      SET status = 'rejected', admin_notes = ${notes || null}, updated_at = NOW()
      WHERE id = ${Number.parseInt(depositId)}
    `
    return true
  } catch (error) {
    console.error("Error rejecting crypto deposit:", error)
    return false
  }
}

export async function getAdminSetting(key: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT setting_value FROM admin_settings WHERE setting_key = ${key}
    `
    return result.length > 0 ? result[0].setting_value : null
  } catch (error) {
    console.error("Error getting admin setting:", error)
    return null
  }
}

export async function updateAdminSetting(key: string, value: string) {
  try {
    await sql`
      INSERT INTO admin_settings (setting_key, setting_value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
    `
    return true
  } catch (error) {
    console.error("Error updating admin setting:", error)
    return false
  }
}

export async function getAllAdminSettings() {
  try {
    const result = await sql`SELECT setting_key, setting_value FROM admin_settings`
    const settings: Record<string, string> = {}
    result.forEach((row) => {
      settings[row.setting_key] = row.setting_value
    })
    return settings
  } catch (error) {
    console.error("Error getting all admin settings:", error)
    return {}
  }
}

export async function getOrderStats() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(amount), 0) as total_spent
      FROM orders
    `
    return {
      totalOrders: Number.parseInt(result[0].total_orders),
      totalSpent: Number.parseFloat(result[0].total_spent),
    }
  } catch (error) {
    console.error("Error getting order stats:", error)
    return { totalOrders: 0, totalSpent: 0 }
  }
}

export async function getAllOrders() {
  try {
    const result = await sql`
      SELECT o.id, o.user_id, o.service_name, o.link, o.quantity, o.amount, o.status, 
             o.provider_order_id, o.created_at, u.username, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      serviceName: row.service_name,
      link: row.link,
      quantity: row.quantity,
      amount: Number.parseFloat(row.amount),
      status: row.status,
      providerOrderId: row.provider_order_id,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting all orders:", error)
    return []
  }
}

export async function getRecentOrders(limit = 20) {
  try {
    const result = await sql`
      SELECT o.id, o.user_id, o.service_name, o.link, o.quantity, o.amount, o.status, 
             o.provider_order_id, o.created_at, u.username, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ${limit}
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id.toString(),
      serviceName: row.service_name,
      link: row.link,
      quantity: row.quantity,
      amount: Number.parseFloat(row.amount),
      status: row.status,
      providerOrderId: row.provider_order_id,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting recent orders:", error)
    return []
  }
}

export async function getProfitBalance(): Promise<number> {
  try {
    const result = await getAdminSetting("admin_profit_balance")
    return Number.parseFloat(result || "0")
  } catch (error) {
    console.error("Error getting profit balance:", error)
    return 0
  }
}

export async function updateProfitBalance(amount: number) {
  try {
    const currentProfit = await getProfitBalance()
    const newProfit = currentProfit + amount
    await updateAdminSetting("admin_profit_balance", newProfit.toString())
    return true
  } catch (error) {
    console.error("Error updating profit balance:", error)
    return false
  }
}

export async function getApiWalletBalance(): Promise<number> {
  try {
    const result = await getAdminSetting("api_wallet_balance")
    return Number.parseFloat(result || "0")
  } catch (error) {
    console.error("Error getting API wallet balance:", error)
    return 0
  }
}

// Neon serverless does not support traditional transactions across multiple HTTP requests
export async function atomicOrderTransaction(
  userId: string,
  userCharge: number,
  apiCost: number,
  profitAmount: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Pre-flight checks
    const apiBalance = await getApiWalletBalance()
    if (apiBalance < apiCost) {
      return { success: false, error: "Service temporarily unavailable. Please try again later." }
    }

    const user = await getUserById(userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }
    if (user.balance < userCharge) {
      return { success: false, error: "Insufficient balance" }
    }

    // Calculate new balances
    const newUserBalance = user.balance - userCharge
    const newApiBalance = apiBalance - apiCost
    const currentProfit = await getProfitBalance()
    const newProfitBalance = currentProfit + profitAmount

    // Execute balance updates sequentially (Neon serverless compatible)
    // User balance deduction
    const userResult = await sql`
      UPDATE users 
      SET balance = ${newUserBalance}, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)} AND balance >= ${userCharge}
      RETURNING id
    `

    if (userResult.length === 0) {
      return { success: false, error: "Balance changed during transaction. Please try again." }
    }

    // API wallet deduction
    await updateAdminSetting("api_wallet_balance", newApiBalance.toString())

    // Profit wallet credit
    await updateAdminSetting("admin_profit_balance", newProfitBalance.toString())

    return { success: true }
  } catch (error) {
    console.error("Transaction failed:", error)
    return { success: false, error: "Transaction failed. Please try again." }
  }
}

export async function generateApiKey(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let apiKey = "stb_"
  for (let i = 0; i < 48; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return apiKey
}

export async function createUserApiKey(userId: string) {
  try {
    const apiKey = await generateApiKey()
    await sql`
      UPDATE users 
      SET api_key = ${apiKey}, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)}
    `
    return apiKey
  } catch (error) {
    console.error("Error creating API key:", error)
    return null
  }
}

export async function getUserByApiKey(apiKey: string) {
  try {
    const result = await sql`
      SELECT id, email, username, balance, is_admin, created_at 
      FROM users 
      WHERE api_key = ${apiKey}
    `
    if (result.length === 0) return null
    return {
      id: result[0].id.toString(),
      email: result[0].email,
      username: result[0].username,
      balance: Number.parseFloat(result[0].balance),
      isAdmin: result[0].is_admin || false,
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error getting user by API key:", error)
    return null
  }
}

export async function revokeApiKey(userId: string) {
  try {
    await sql`
      UPDATE users 
      SET api_key = NULL, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)}
    `
    return true
  } catch (error) {
    console.error("Error revoking API key:", error)
    return false
  }
}

export async function getUserApiKey(userId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT api_key FROM users WHERE id = ${Number.parseInt(userId)}
    `
    return result.length > 0 ? result[0].api_key : null
  } catch (error) {
    console.error("Error getting user API key:", error)
    return null
  }
}

export async function banUser(userId: string) {
  try {
    await sql`
      UPDATE users 
      SET is_banned = TRUE, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)}
    `
    return true
  } catch (error) {
    console.error("Error banning user:", error)
    return false
  }
}

export async function unbanUser(userId: string) {
  try {
    await sql`
      UPDATE users 
      SET is_banned = FALSE, updated_at = NOW() 
      WHERE id = ${Number.parseInt(userId)}
    `
    return true
  } catch (error) {
    console.error("Error unbanning user:", error)
    return false
  }
}

export async function createActivityLog(userId: string | null, action: string, details: string, ipAddress?: string) {
  try {
    await sql`
      INSERT INTO activity_logs (user_id, action, details, ip_address)
      VALUES (${userId ? Number.parseInt(userId) : null}, ${action}, ${details}, ${ipAddress || null})
    `
    return true
  } catch (error) {
    console.error("Error creating activity log:", error)
    return false
  }
}

export const logActivity = createActivityLog

export async function getActivityLogs(limit = 100) {
  try {
    const result = await sql`
      SELECT al.id, al.user_id, al.action, al.details, al.ip_address, al.created_at, u.username, u.email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
    `
    return result.map((row) => ({
      id: row.id.toString(),
      userId: row.user_id ? row.user_id.toString() : null,
      action: row.action,
      details: row.details,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
      username: row.username,
      email: row.email,
    }))
  } catch (error) {
    console.error("Error getting activity logs:", error)
    return []
  }
}

export async function getUserTier(userId: number): Promise<number> {
  try {
    // Check if user has an active Tier 3 subscription
    const tier3 = await sql`
      SELECT id FROM tier3_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      LIMIT 1
    `
    if (tier3.length > 0) return 3

    // Check if user has an active Tier 2 subscription
    const tier2 = await sql`
      SELECT id FROM tier2_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      LIMIT 1
    `
    if (tier2.length > 0) return 2

    // Check if user has an active Tier 1 subscription
    const tier1 = await sql`
      SELECT id FROM tier1_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      LIMIT 1
    `
    if (tier1.length > 0) return 1

    return 0
  } catch (error) {
    console.error("Error getting user tier:", error)
    return 0
  }
}

export async function getTier1Subscription(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier1_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      ORDER BY subscription_start DESC
      LIMIT 1
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error getting Tier 1 subscription:", error)
    return null
  }
}

export async function getTier1Orders(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier1_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result || []
  } catch (error) {
    console.error("Error getting Tier 1 orders:", error)
    return []
  }
}

export async function getTier2Subscription(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier2_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      ORDER BY subscription_start DESC
      LIMIT 1
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error getting Tier 2 subscription:", error)
    return null
  }
}

export async function getTier2Orders(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier2_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result || []
  } catch (error) {
    console.error("Error getting Tier 2 orders:", error)
    return []
  }
}

export async function getTier3Subscription(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier3_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      AND (subscription_end IS NULL OR subscription_end > NOW())
      ORDER BY subscription_start DESC
      LIMIT 1
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error getting Tier 3 subscription:", error)
    return null
  }
}

export async function getTier3Orders(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM tier3_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result || []
  } catch (error) {
    console.error("Error getting Tier 3 orders:", error)
    return []
  }
}

// Updated subscription activation logic to use ON CONFLICT
export async function activateTier1Subscription(userId: number) {
  try {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await sql`
      INSERT INTO tier1_subscriptions (user_id, status, subscription_start, subscription_end)
      VALUES (${userId}, 'active', NOW(), ${endDate})
      ON CONFLICT (user_id) DO UPDATE 
      SET status = 'active', subscription_start = NOW(), subscription_end = ${endDate}
    `
    return true
  } catch (error) {
    console.error("Error activating Tier 1 subscription:", error)
    return false
  }
}

export async function activateTier2Subscription(userId: number) {
  try {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await sql`
      INSERT INTO tier2_subscriptions (user_id, status, subscription_start, subscription_end)
      VALUES (${userId}, 'active', NOW(), ${endDate})
      ON CONFLICT (user_id) DO UPDATE 
      SET status = 'active', subscription_start = NOW(), subscription_end = ${endDate}
    `
    return true
  } catch (error) {
    console.error("Error activating Tier 2 subscription:", error)
    return false
  }
}

export async function activateTier3Subscription(userId: number) {
  try {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await sql`
      INSERT INTO tier3_subscriptions (user_id, status, subscription_start, subscription_end)
      VALUES (${userId}, 'active', NOW(), ${endDate})
      ON CONFLICT (user_id) DO UPDATE 
      SET status = 'active', subscription_start = NOW(), subscription_end = ${endDate}
    `
    return true
  } catch (error) {
    console.error("Error activating Tier 3 subscription:", error)
    return false
  }
}

// Renamed and updated chat message functions
export async function createChatMessage(userId: number, message: string, imageUrl?: string) {
  try {
    const result = await sql`
      INSERT INTO chat_messages (user_id, message, image_url)
      VALUES (${userId}, ${message}, ${imageUrl || null})
      RETURNING id, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating chat message:", error)
    return null
  }
}

export async function getChatMessages(userId: number, limit = 50) {
  try {
    const result = await sql`
      SELECT id, user_id, message, image_url, admin_reply, is_read, created_at, updated_at
      FROM chat_messages
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting chat messages:", error)
    return []
  }
}

export async function getAllChatMessages(limit = 100) {
  try {
    const result = await sql`
      SELECT cm.id, cm.user_id, cm.message, cm.image_url, cm.admin_reply, cm.is_read, 
             cm.created_at, cm.updated_at, u.username, u.email
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting all chat messages:", error)
    return []
  }
}

// Updated admin reply function
export async function replyToChatMessage(messageId: number, reply: string) {
  try {
    await sql`
      UPDATE chat_messages
      SET admin_reply = ${reply}, is_read = TRUE, updated_at = NOW()
      WHERE id = ${messageId}
    `
    return true
  } catch (error) {
    console.error("Error replying to chat message:", error)
    return false
  }
}

// Added Notification functions
export async function createNotification(userId: number, title: string, message: string, type = "info") {
  try {
    const result = await sql`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (${userId}, ${title}, ${message}, ${type})
      RETURNING id, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function getNotifications(userId: number, limit = 20) {
  try {
    const result = await sql`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

export async function markNotificationRead(notificationId: number) {
  try {
    await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ${notificationId}
    `
    return true
  } catch (error) {
    console.error("Error marking notification read:", error)
    return false
  }
}

export async function markAllNotificationsRead(userId: number) {
  try {
    await sql`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ${userId}
    `
    return true
  } catch (error) {
    console.error("Error marking all notifications read:", error)
    return false
  }
}

export async function createActiveSession(userId: string, ipAddress?: string) {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await sql`
      INSERT INTO active_sessions (user_id, session_id, ip_address, expires_at)
      VALUES (${Number.parseInt(userId)}, ${sessionId}, ${ipAddress || null}, ${expiresAt})
    `
    return sessionId
  } catch (error) {
    console.error("Error creating active session:", error)
    return null
  }
}

export async function updateActiveSessionActivity(sessionId: string) {
  try {
    await sql`
      UPDATE active_sessions 
      SET last_activity = NOW(), updated_at = NOW()
      WHERE session_id = ${sessionId}
    `
    return true
  } catch (error) {
    console.error("Error updating session activity:", error)
    return false
  }
}

export async function isUserBanned(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT is_banned FROM users WHERE id = ${Number.parseInt(userId)}
    `
    return result.length > 0 ? result[0].is_banned : false
  } catch (error) {
    console.error("Error checking user ban status:", error)
    return false
  }
}

export async function createApiSubscription(
  userId: string,
  planName: string,
  requestsPerMonth: number,
  amount: number,
) {
  try {
    const result = await sql`
      INSERT INTO api_subscriptions (user_id, plan_name, requests_per_month, amount, status)
      VALUES (${Number.parseInt(userId)}, ${planName}, ${requestsPerMonth}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating API subscription:", error)
    return null
  }
}

export async function activateApiSubscription(subscriptionId: string) {
  try {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    await sql`
      UPDATE api_subscriptions
      SET status = 'active', activation_date = NOW(), expiration_date = ${endDate}
      WHERE id = ${Number.parseInt(subscriptionId)}
    `
    return true
  } catch (error) {
    console.error("Error activating API subscription:", error)
    return false
  }
}

export async function getActiveApiSubscription(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM api_subscriptions
      WHERE user_id = ${Number.parseInt(userId)} AND status = 'active'
      ORDER BY activation_date DESC LIMIT 1
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error getting active API subscription:", error)
    return null
  }
}

export async function getUserWallet(userId: string) {
  try {
    const result = await sql`
      SELECT balance FROM users WHERE id = ${Number.parseInt(userId)}
    `
    return result.length > 0 ? Number.parseFloat(result[0].balance) : 0
  } catch (error) {
    console.error("Error getting user wallet:", error)
    return 0
  }
}

export async function deductWalletFunds(userId: string, amount: number) {
  try {
    const user = await getUserById(userId)
    if (!user || user.balance < amount) {
      return false
    }

    const newBalance = user.balance - amount
    await sql`
      UPDATE users 
      SET balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${Number.parseInt(userId)}
    `
    return true
  } catch (error) {
    console.error("Error deducting wallet funds:", error)
    return false
  }
}

export async function createTier1Subscription(userId: string, amount: number) {
  try {
    const result = await sql`
      INSERT INTO tier1_subscriptions (user_id, amount, status)
      VALUES (${Number.parseInt(userId)}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 1 subscription:", error)
    return null
  }
}

export async function createTier1Order(
  userId: string,
  serviceName: string,
  link: string,
  quantity: number,
  amount: number,
) {
  try {
    const result = await sql`
      INSERT INTO tier1_orders (user_id, service_name, link, quantity, amount, status)
      VALUES (${Number.parseInt(userId)}, ${serviceName}, ${link}, ${quantity}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 1 order:", error)
    return null
  }
}

export async function updateTier1OrderStatus(orderId: string, status: string) {
  try {
    await sql`
      UPDATE tier1_orders SET status = ${status}, updated_at = NOW() WHERE id = ${Number.parseInt(orderId)}
    `
    return true
  } catch (error) {
    console.error("Error updating Tier 1 order status:", error)
    return false
  }
}

export async function createTier2Subscription(userId: string, amount: number) {
  try {
    const result = await sql`
      INSERT INTO tier2_subscriptions (user_id, amount, status)
      VALUES (${Number.parseInt(userId)}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 2 subscription:", error)
    return null
  }
}

export async function createTier2Order(
  userId: string,
  serviceName: string,
  link: string,
  quantity: number,
  amount: number,
) {
  try {
    const result = await sql`
      INSERT INTO tier2_orders (user_id, service_name, link, quantity, amount, status)
      VALUES (${Number.parseInt(userId)}, ${serviceName}, ${link}, ${quantity}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 2 order:", error)
    return null
  }
}

export async function updateTier2OrderStatus(orderId: string, status: string) {
  try {
    await sql`
      UPDATE tier2_orders SET status = ${status}, updated_at = NOW() WHERE id = ${Number.parseInt(orderId)}
    `
    return true
  } catch (error) {
    console.error("Error updating Tier 2 order status:", error)
    return false
  }
}

export async function createTier3Subscription(userId: string, amount: number) {
  try {
    const result = await sql`
      INSERT INTO tier3_subscriptions (user_id, amount, status)
      VALUES (${Number.parseInt(userId)}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 3 subscription:", error)
    return null
  }
}

export async function createTier3Order(
  userId: string,
  serviceName: string,
  link: string,
  quantity: number,
  amount: number,
) {
  try {
    const result = await sql`
      INSERT INTO tier3_orders (user_id, service_name, link, quantity, amount, status)
      VALUES (${Number.parseInt(userId)}, ${serviceName}, ${link}, ${quantity}, ${amount}, 'pending')
      RETURNING id, created_at
    `
    return {
      id: result[0].id.toString(),
      createdAt: result[0].created_at,
    }
  } catch (error) {
    console.error("Error creating Tier 3 order:", error)
    return null
  }
}

export async function updateTier3OrderStatus(orderId: string, status: string) {
  try {
    await sql`
      UPDATE tier3_orders SET status = ${status}, updated_at = NOW() WHERE id = ${Number.parseInt(orderId)}
    `
    return true
  } catch (error) {
    console.error("Error updating Tier 3 order status:", error)
    return false
  }
}

export async function getBlogPosts(limit = 10, offset = 0) {
  try {
    const result = await sql`
      SELECT id, title, slug, excerpt, featured_image, created_at, updated_at
      FROM blog_posts
      WHERE published = TRUE
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result || []
  } catch (error) {
    console.error("Error getting blog posts:", error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const result = await sql`
      SELECT id, title, slug, content, excerpt, featured_image, created_at, updated_at
      FROM blog_posts
      WHERE slug = ${slug} AND published = TRUE
      LIMIT 1
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error getting blog post by slug:", error)
    return null
  }
}

export async function getActiveUsersCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM activity_logs 
      WHERE created_at > NOW() - INTERVAL '30 days'
    `
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error("Error getting active users count:", error)
    return 0
  }
}

export async function notifyAdminOnUserActivity(userId: string, action: string, details: string) {
  try {
    const adminUser = await sql`
      SELECT id FROM users WHERE is_admin = TRUE LIMIT 1
    `
    if (adminUser.length === 0) return false

    await createNotification(adminUser[0].id, "User Activity", `${action}: ${details}`, "user_activity")
    return true
  } catch (error) {
    console.error("Error notifying admin on user activity:", error)
    return false
  }
}

export async function getAdminNotifications(limit = 20) {
  try {
    const result = await sql`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE type IN ('admin', 'alert', 'user_activity')
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result || []
  } catch (error) {
    console.error("Error getting admin notifications:", error)
    return []
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${Number.parseInt(userId)} AND is_read = FALSE
    `
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    return 0
  }
}

export async function createLiveChatMessage(userId: number, message: string, imageUrl?: string) {
  return createChatMessage(userId, message, imageUrl)
}

export async function getLiveChatMessages(userId: number, limit = 50) {
  return getChatMessages(userId, limit)
}
