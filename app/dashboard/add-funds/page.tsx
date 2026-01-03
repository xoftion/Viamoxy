import { getSession } from "@/lib/session"
import { getAdminSetting } from "@/lib/db"
import { AddFundsClient } from "./add-funds-client"

export const dynamic = "force-dynamic"

export default async function AddFundsPage() {
  const session = await getSession()

  const [usdtWallet, tonWallet, bankAccount, bankName, accountName] = await Promise.all([
    getAdminSetting("usdt_wallet").then((v) => v || "TRC20 wallet not configured"),
    getAdminSetting("ton_wallet").then((v) => v || "TON wallet not configured"),
    getAdminSetting("bank_account").then((v) => v || "0123456789"),
    getAdminSetting("bank_name").then((v) => v || "Opay"),
    getAdminSetting("account_name").then((v) => v || "STABOOST"),
  ])

  return (
    <AddFundsClient
      balance={session.user?.balance || 0}
      transactions={session.transactions}
      cryptoWallets={{
        usdt: usdtWallet,
        ton: tonWallet,
      }}
      bankDetails={{
        bankName,
        accountNumber: bankAccount,
        accountName,
      }}
    />
  )
}
