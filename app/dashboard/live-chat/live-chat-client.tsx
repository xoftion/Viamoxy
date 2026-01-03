"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, ImageIcon, Headphones, Clock, CheckCircle, Bot } from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  id: number
  user_id: number
  message: string
  image_url: string | null
  created_at: string
  is_admin?: boolean
  admin_reply?: string
}

interface LiveChatClientProps {
  userId: number
  username: string
  initialMessages: ChatMessage[]
}

export function LiveChatClient({ userId, username, initialMessages }: LiveChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (imageUrl?: string) => {
    if (!newMessage.trim() && !imageUrl) return

    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage || "Sent an image",
          imageUrl,
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setNewMessage("")
      toast.success("Message sent! Our team will respond shortly.")
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      await sendMessage(data.url)
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Chat Support</h1>
        <p className="text-muted-foreground">Get help from our support team</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b bg-primary/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">STABOOST Support</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online - Typically replies within 1 hour
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Headphones className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">Start a Conversation</h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      Send a message or screenshot to get help from our support team.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        {/* User message */}
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 rounded-2xl rounded-tl-sm bg-primary/10 p-3">
                              {msg.message && <p className="text-sm">{msg.message}</p>}
                              {msg.image_url && (
                                <img
                                  src={msg.image_url || "/placeholder.svg"}
                                  alt="Uploaded"
                                  className="mt-2 max-w-full rounded-lg"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin reply if exists */}
                        {msg.admin_reply && (
                          <div className="flex gap-3 justify-end">
                            <div className="flex-1 max-w-[80%] flex flex-col items-end">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Admin</span>
                                <span className="font-semibold text-sm text-primary">STABOOST Support</span>
                              </div>
                              <div className="mt-1 rounded-2xl rounded-tr-sm bg-primary text-white p-3">
                                <p className="text-sm">{msg.admin_reply}</p>
                              </div>
                            </div>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-white text-xs">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t p-4 bg-background flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-shrink-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={sending || !newMessage.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-medium">9AM - 10PM WAT</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">10AM - 6PM WAT</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium">12PM - 5PM WAT</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• Upload screenshots for faster resolution</p>
              <p>• Include your order ID if it's about an order</p>
              <p>• Be specific about the issue</p>
              <p>• Check FAQ before asking common questions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
