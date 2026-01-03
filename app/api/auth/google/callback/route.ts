import { type NextRequest, NextResponse } from "next/server"
import { handleGoogleCallback } from "@/app/actions/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    console.error("[v0] Google OAuth error:", error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    console.error("[v0] No authorization code received")
    return NextResponse.redirect(new URL("/login?error=No authorization code received", request.url))
  }

  try {
    console.log("[v0] Processing Google callback with code")
    const result = await handleGoogleCallback(code)
    console.log("[v0] Google callback result:", result)

    if (result.success) {
      const dashboardUrl = new URL("/dashboard", "https://staboost.name.ng")
      return NextResponse.redirect(dashboardUrl)
    } else {
      const loginUrl = new URL(
        `/login?error=${encodeURIComponent(result.error || "Authentication failed")}`,
        "https://staboost.name.ng",
      )
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    console.error("[v0] Google callback error:", error)
    const loginUrl = new URL("/login?error=Authentication failed. Please try again.", "https://staboost.name.ng")
    return NextResponse.redirect(loginUrl)
  }
}
