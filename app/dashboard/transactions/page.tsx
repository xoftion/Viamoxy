import { getSession } from "@/lib/session"
import { getTransactionsByUserId } from "@/lib/db"
import { TransactionsClient } from "./transactions-client"

export default async function TransactionsPage() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const transactions = await getTransactionsByUserId(session.userId)

  return <TransactionsClient transactions={transactions} />
}
