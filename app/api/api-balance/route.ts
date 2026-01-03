export const dynamic = "force-dynamic"

import { getBalance } from "@/lib/cloutflash"
import { updateAdminSetting, getAdminSetting } from "@/lib/db"

export async function GET() {
  try {
    const balance = await getBalance()
    const balanceUSD = Number.parseFloat(balance.balance || "0")
    const balanceNGN = balanceUSD * 1600

    // Store in database
    await updateAdminSetting("api_wallet_balance", balanceNGN.toString())

    // Check if below threshold
    const threshold = Number.parseFloat((await getAdminSetting("api_wallet_low_threshold")) || "5000")
    const isLow = balanceNGN < threshold

    return Response.json({
      balance: balanceNGN,
      balanceUSD,
      isLow,
      threshold,
    })
  } catch (error) {
    console.error("Failed to fetch API balance:", error)
    return Response.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
