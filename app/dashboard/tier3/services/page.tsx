import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier } from "@/lib/db"
import { getShopServices } from "@/lib/shoprime"
import { Tier3ServicesClient } from "./tier3-services-client"

export default async function Tier3ServicesPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const isAdmin = session.user.email === "staboost.io@gmail.com"

  if (!isAdmin) {
    const userTier = await getUserTier(userId)
    if (userTier < 3) {
      redirect("/dashboard/tier3")
    }
  }

  let services = []

  try {
    services = await getShopServices()
  } catch (error) {
    console.error("Error fetching services:", error)
  }

  return <Tier3ServicesClient services={services} balance={session.user.balance} />
}
