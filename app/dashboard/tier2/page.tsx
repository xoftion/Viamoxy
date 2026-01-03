import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier, getTier2Subscription } from "@/lib/db"
import { Tier2Client } from "./tier2-client"

const ADMIN_EMAIL = "staboost.io@gmail.com"

export default async function Tier2Page() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const isAdmin = session.user.email === ADMIN_EMAIL
  const userTier = isAdmin ? 2 : await getUserTier(Number(session.user.id))

  let subscription = null
  if (userTier === 2) {
    subscription = isAdmin
      ? { status: "active", subscription_end: "2099-12-31" }
      : await getTier2Subscription(Number(session.user.id))
  }

  return (
    <Tier2Client userTier={userTier} subscription={subscription} balance={session.user.balance} isAdmin={isAdmin} />
  )
}
