import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier, getTier1Subscription } from "@/lib/db"
import { Tier1Client } from "./tier1-client"

const ADMIN_EMAIL = "staboost.io@gmail.com"

export default async function Tier1Page() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const isAdmin = session.user.email === ADMIN_EMAIL
  const userTier = isAdmin ? 1 : await getUserTier(Number(session.user.id))

  let subscription = null
  if (userTier === 1) {
    subscription = isAdmin
      ? { status: "active", subscription_end: "2099-12-31" }
      : await getTier1Subscription(Number(session.user.id))
  }

  return (
    <Tier1Client userTier={userTier} subscription={subscription} balance={session.user.balance} isAdmin={isAdmin} />
  )
}
