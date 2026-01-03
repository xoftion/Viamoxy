import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier } from "@/lib/db"
import { Tier2NewOrderClient } from "./tier2-new-order-client"

export default async function Tier2NewOrderPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userTier = await getUserTier(Number(session.user.id))
  if (userTier !== 2) {
    redirect("/dashboard/tier2")
  }

  return <Tier2NewOrderClient balance={session.user.balance} />
}
