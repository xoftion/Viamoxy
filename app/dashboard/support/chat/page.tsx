import { getLiveChatMessages } from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { LiveChatClient } from "./live-chat-client"

export default async function LiveChatPage() {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  const messages = await getLiveChatMessages(100)

  return <LiveChatClient messages={messages} userId={Number(session.user.id)} />
}
