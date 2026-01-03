import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getChatMessages } from "@/lib/db"
import { LiveChatClient } from "./live-chat-client"

export default async function LiveChatPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const userId = Number(session.user.id)
  let messages = []
  try {
    messages = await getChatMessages(userId)
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    messages = []
  }

  return <LiveChatClient userId={userId} username={session.user.username} initialMessages={messages || []} />
}
