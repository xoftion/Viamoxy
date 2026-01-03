"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, RefreshCw, Send, Reply, ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/chat-messages")
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleReply = async (messageId: string) => {
    const reply = replyText[messageId]
    if (!reply?.trim()) {
      toast.error("Enter a reply")
      return
    }

    try {
      const res = await fetch(`/api/admin/chat-messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })

      if (res.ok) {
        toast.success("Reply sent")
        setReplyText((prev) => ({ ...prev, [messageId]: "" }))
        setReplyingTo(null)
        fetchMessages()
      } else {
        toast.error("Failed to send reply")
      }
    } catch (error) {
      toast.error("Error sending reply")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle size={24} />
          Chat Messages
        </h2>
        <Button onClick={fetchMessages} variant="outline" size="sm" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Support Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{msg.username || "User"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                        {msg.admin_reply && <Badge className="bg-green-600">Replied</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.email}</p>
                    </div>
                  </div>

                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{msg.message}</p>

                  {msg.image_url && (
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-muted-foreground" />
                      <a
                        href={msg.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Attached Image
                      </a>
                    </div>
                  )}

                  {msg.admin_reply && (
                    <div className="bg-primary/10 p-3 rounded-lg border-l-4 border-primary">
                      <p className="text-xs font-semibold text-primary mb-1">Admin Reply:</p>
                      <p className="text-sm">{msg.admin_reply}</p>
                    </div>
                  )}

                  {replyingTo === msg.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText[msg.id] || ""}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(msg.id)}>
                          <Send size={14} className="mr-1" />
                          Send Reply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(msg.id)}>
                      <Reply size={14} className="mr-1" />
                      {msg.admin_reply ? "Edit Reply" : "Reply"}
                    </Button>
                  )}
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages yet</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
