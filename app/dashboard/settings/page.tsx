import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import SettingsClient from "./settings-client"
import { getUserApiKey, getActiveApiSubscription } from "@/lib/db"

export default async function SettingsPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = String(session.user.id)

  const [apiKey, subscription] = await Promise.all([getUserApiKey(userId), getActiveApiSubscription(userId)])

  return (
    <SettingsClient
      user={{
        id: userId,
        email: session.user.email,
        username: session.user.username,
        balance: session.user.balance,
      }}
      initialApiKey={apiKey}
      subscription={subscription}
    />
  )
}
