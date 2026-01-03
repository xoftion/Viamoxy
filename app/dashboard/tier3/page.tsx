import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserTier, getTier3Subscription } from "@/lib/db"
import { Tier3Client } from "./tier3-client"

const ADMIN_EMAIL = "staboost.io@gmail.com"

export default async function Tier3Page() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const isAdmin = session.user.email === ADMIN_EMAIL
  const userTier = isAdmin ? 3 : await getUserTier(Number(session.user.id))

  let subscription = null
  if (userTier === 3) {
    subscription = isAdmin
      ? { status: "active", subscription_end: "2099-12-31" }
      : await getTier3Subscription(Number(session.user.id))
  }

  return (
    <Tier3Client userTier={userTier} subscription={subscription} balance={session.user.balance} isAdmin={isAdmin} />
  )
}
