import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getTier1Subscription } from "@/lib/db"
import { getServicesWithMarkup } from "@/lib/thekclaut"
import { Tier1ServicesClient } from "./tier1-services-client"

export default async function Tier1ServicesPage() {
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

  let services = []
  let categories: string[] = []

  try {
    services = await getServicesWithMarkup()
    categories = [...new Set(services.map((s: any) => s.category))]
  } catch (error) {
    console.error("Error fetching services:", error)
  }

  return <Tier1ServicesClient services={services} categories={categories} balance={session.user.balance} />
}
