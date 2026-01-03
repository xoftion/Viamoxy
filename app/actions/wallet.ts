"use server"

import { getSession } from "@/lib/session"
import { createTransaction, createCryptoDeposit } from "@/lib/db"
import type { ActionResult } from "@/lib/types"

export async function submitDepositRequest(amount: number): Promise<ActionResult<void>> {
  const session = await getSession()

  if (!session.user) {
    return { success: false, error: "You must be logged in to add funds" }
  }

  if (amount < 1000) {
    return { success: false, error: "Minimum deposit is ₦1,000" }
  }

  if (amount > 500000) {
    return { success: false, error: "Maximum deposit is ₦500,000" }
  }

  await createTransaction(
    session.user.id,
    "deposit",
    amount,
    `Bank Transfer deposit - Awaiting confirmation`,
    "pending",
  )

  return { success: true, data: undefined }
}

export async function submitCryptoDeposit(
  cryptoType: string,
  cryptoAmount: number,
  walletAddress: string,
  ngnAmount: number,
): Promise<ActionResult<void>> {
  const session = await getSession()

  if (!session.user) {
    return { success: false, error: "You must be logged in to add funds" }
  }

  if (ngnAmount < 1000) {
    return { success: false, error: "Minimum deposit is ₦1,000" }
  }

  const result = await createCryptoDeposit(
    session.user.id,
    cryptoType.toUpperCase(),
    cryptoAmount,
    walletAddress,
    ngnAmount,
  )

  if (!result) {
    return { success: false, error: "Failed to create deposit request" }
  }

  return { success: true, data: undefined }
}
