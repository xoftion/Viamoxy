import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier } from "@/lib/db"
import { getFollowedServices } from "@/lib/getfollowed"
import { Tier2ServicesClient } from "./tier2-services-client"

export default async function Tier2ServicesPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  const isAdmin = session.user.email === "staboost.io@gmail.com"

  if (!isAdmin) {
    const userTier = await getUserTier(userId)
    if (userTier < 2) {
      redirect("/dashboard/tier2")
    }
  }

  let services = []

  try {
    services = await getFollowedServices()
  } catch (error) {
    console.error("Error fetching services:", error)
  }

  return <Tier2ServicesClient services={services} balance={session.user.balance} />
}
