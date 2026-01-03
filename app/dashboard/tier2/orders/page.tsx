import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getTier2Subscription, getTier1Subscription } from "@/lib/db"
import { Tier2OrdersClient } from "./tier2-orders-client"

export default async function Tier2OrdersPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const isAdmin = session.user.email === "staboost.io@gmail.com"

  if (!isAdmin) {
    const tier2Sub = await getTier2Subscription(userId)
    const tier1Sub = await getTier1Subscription(userId)

    // User needs Tier 1 first before Tier 2
    if (!tier1Sub) {
      redirect("/dashboard/tier1")
    }

    if (!tier2Sub) {
      redirect("/dashboard/tier2")
    }
  }

  return <Tier2OrdersClient />
}
