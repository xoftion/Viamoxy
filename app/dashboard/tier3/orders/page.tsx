import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getTier3Subscription, getTier2Subscription, getTier1Subscription } from "@/lib/db"
import { Tier3OrdersClient } from "./tier3-orders-client"

export default async function Tier3OrdersPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const isAdmin = session.user.email === "staboost.io@gmail.com"

  if (!isAdmin) {
    const tier1Sub = await getTier1Subscription(userId)
    const tier2Sub = await getTier2Subscription(userId)
    const tier3Sub = await getTier3Subscription(userId)

    // User needs Tier 1 and Tier 2 first before Tier 3
    if (!tier1Sub) {
      redirect("/dashboard/tier1")
    }

    if (!tier2Sub) {
      redirect("/dashboard/tier2")
    }

    if (!tier3Sub) {
      redirect("/dashboard/tier3")
    }
  }

  return <Tier3OrdersClient />
}
