import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier } from "@/lib/db"
import { Tier3NewOrderClient } from "./tier3-new-order-client"

export default async function Tier3NewOrderPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userTier = await getUserTier(Number(session.user.id))
  if (userTier !== 3) {
    redirect("/dashboard/tier3")
  }

  return <Tier3NewOrderClient balance={session.user.balance} />
}
