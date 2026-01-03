import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier } from "@/lib/db"
import { getServicesWithMarkup } from "@/lib/thekclaut"
import { Tier1NewOrderClient } from "./tier1-new-order-client"

export default async function Tier1NewOrderPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userTier = await getUserTier(Number(session.user.id))
  if (userTier !== 1) {
    redirect("/dashboard/tier1")
  }

  const services = await getServicesWithMarkup()
  const categories = [...new Set(services.map((s) => s.category))]

  return <Tier1NewOrderClient services={services} categories={categories} balance={session.user.balance} />
}
