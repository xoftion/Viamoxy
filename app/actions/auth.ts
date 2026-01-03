"use server"

import { redirect } from "next/navigation"
import { createUser, getUserByEmail, verifyPassword, logActivity, isUserBanned, sql } from "@/lib/db"
import { createSession, destroySession } from "@/lib/session"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"
import type { ActionResult } from "@/lib/types"

const loginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

function getGoogleRedirectUri() {
  return "https://staboost.name.ng/api/auth/google/callback"
}

export async function googleLoginAction(): Promise<ActionResult<{ url: string }>> {
  if (!GOOGLE_CLIENT_ID) {
    return { success: false, error: "Google sign-in is not configured. Please contact support." }
  }

  const redirectUri = getGoogleRedirectUri()
  const scope = encodeURIComponent("openid email profile")
  const state = Math.random().toString(36).substring(7)

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&access_type=offline` +
    `&prompt=consent`

  return { success: true, data: { url: googleAuthUrl } }
}

export async function handleGoogleCallback(code: string): Promise<ActionResult<void>> {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return { success: false, error: "Google OAuth not configured" }
    }

    const redirectUri = getGoogleRedirectUri()

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      return { success: false, error: "Failed to get access token from Google" }
    }

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser = await userInfoResponse.json()

    if (!googleUser.email) {
      return { success: false, error: "Failed to get user email from Google" }
    }

    // Check if user exists
    let user = await getUserByEmail(googleUser.email)

    if (user) {
      // Existing user - check if banned
      const banned = await isUserBanned(user.id)
      if (banned) {
        return { success: false, error: "Your account has been suspended. Please contact support." }
      }
    } else {
      // New user - create account
      const username = googleUser.name || googleUser.email.split("@")[0]
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const newUser = await createUser(googleUser.email, username, randomPassword)

      if (!newUser) {
        return { success: false, error: "Failed to create account" }
      }

      // Update user with Google ID for future reference
      await sql`
        UPDATE users 
        SET google_id = ${googleUser.id}, 
            avatar_url = ${googleUser.picture || null}
        WHERE id = ${Number.parseInt(newUser.id)}
      `

      user = await getUserByEmail(googleUser.email)
    }

    if (!user) {
      return { success: false, error: "Failed to retrieve user" }
    }

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    await logActivity(user.id, "google_login", `User logged in via Google: ${googleUser.email}`, ip)
    await createSession(user.id)

    return { success: true, data: undefined }
  } catch (error) {
    console.error("Google OAuth error:", error)
    return { success: false, error: "An error occurred during Google sign-in" }
  }
}

export async function signupAction(formData: FormData): Promise<ActionResult<void>> {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!email || !username || !password) {
    return { success: false, error: "All fields are required" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

  const rateLimitResult = await checkRateLimit(ip, "signup", 10, 60 * 60 * 1000)
  if (!rateLimitResult.allowed) {
    return { success: false, error: "Too many signup attempts. Please try again later." }
  }

  const user = await createUser(email, username, password)

  if (!user) {
    return { success: false, error: "Email already registered" }
  }

  await logActivity(user.id, "signup", `New user registered: ${email}`, ip)

  await createSession(user.id)
  return { success: true, data: undefined }
}

export async function loginAction(formData: FormData): Promise<ActionResult<void>> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email and password are required" }
  }

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

  const rateLimitResult = await checkRateLimit(ip, "login", 20, 15 * 60 * 1000)
  if (!rateLimitResult.allowed) {
    return { success: false, error: "Too many login attempts. Please try again later." }
  }

  const attemptKey = email.toLowerCase()
  const attempt = loginAttempts.get(attemptKey)

  if (attempt) {
    const now = Date.now()
    if (now - attempt.timestamp < LOCKOUT_TIME && attempt.count >= MAX_LOGIN_ATTEMPTS) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempt.timestamp)) / 60000)
      return {
        success: false,
        error: `Too many failed login attempts. Please try again in ${remainingTime} minute${remainingTime > 1 ? "s" : ""}.`,
      }
    }

    if (now - attempt.timestamp >= LOCKOUT_TIME) {
      loginAttempts.delete(attemptKey)
    }
  }

  const user = await getUserByEmail(email)

  if (!user) {
    const current = loginAttempts.get(attemptKey) || { count: 0, timestamp: Date.now() }
    loginAttempts.set(attemptKey, { count: current.count + 1, timestamp: Date.now() })
    return { success: false, error: "Invalid email or password" }
  }

  const banned = await isUserBanned(user.id)
  if (banned) {
    await logActivity(user.id, "login_attempt_banned", `Banned user attempted login: ${email}`, ip)
    return { success: false, error: "Your account has been suspended. Please contact support." }
  }

  if (!verifyPassword(password, user.password)) {
    const current = loginAttempts.get(attemptKey) || { count: 0, timestamp: Date.now() }
    loginAttempts.set(attemptKey, { count: current.count + 1, timestamp: Date.now() })

    await logActivity(user.id, "login_failed", `Failed login attempt: ${email}`, ip)
    return { success: false, error: "Invalid email or password" }
  }

  loginAttempts.delete(attemptKey)

  await logActivity(user.id, "login", `User logged in: ${email}`, ip)

  await createSession(user.id)
  return { success: true, data: undefined }
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/")
}
