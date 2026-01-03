import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getTier1Orders, getTier1Subscription } from "@/lib/db"
import { Tier1OrdersClient } from "./tier1-orders-client"

export default async function Tier1OrdersPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const isAdmin = session.user.email === "staboost.io@gmail.com"

  if (!isAdmin) {
    const subscription = await getTier1Subscription(userId)
    if (!subscription) {
      redirect("/dashboard/tier1")
    }
  }

  let orders = []
  try {
    orders = await getTier1Orders(userId)
  } catch (error) {
    console.error("Error fetching tier1 orders:", error)
    orders = []
  }

  return <Tier1OrdersClient orders={orders || []} balance={session.user.balance} />
}
