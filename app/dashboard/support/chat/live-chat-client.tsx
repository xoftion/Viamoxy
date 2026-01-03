"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Upload, Send } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: number
  user_id: number
  message: string
  image_url?: string
  created_at: string
  username: string
  email: string
}

interface LiveChatClientProps {
  messages: Message[]
  userId: number
}

export function LiveChatClient({ messages, userId }: LiveChatClientProps) {
  const [msgList, setMsgList] = useState(messages)
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMsgList([newMsg, ...msgList])
        setMessage("")
        toast.success("Message sent!")
      } else {
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Error sending message")
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("message", "Screenshot attached")

      const response = await fetch("/api/support/chat", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMsgList([newMsg, ...msgList])
        toast.success("Screenshot uploaded!")
      } else {
        toast.error("Failed to upload screenshot")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Error uploading screenshot")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Live Chat Support</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                {msgList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No messages yet. Start a conversation!</p>
                ) : (
                  msgList.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.user_id === userId ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs ${
                          msg.user_id === userId
                            ? "bg-blue-600 text-white rounded-bl-lg"
                            : "bg-background border rounded-br-lg"
                        } rounded-lg p-3`}
                      >
                        <p className="text-xs opacity-75 mb-1">{msg.username}</p>
                        {msg.image_url && (
                          <img
                            src={msg.image_url || "/placeholder.svg"}
                            alt="Screenshot"
                            className="max-w-full rounded mb-2 max-h-48"
                          />
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.user_id === userId ? "opacity-75" : "opacity-50"}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Screenshot
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!message.trim()} className="flex-1">
                    <Send className="h-4 w-4 mr-1" />
                    Send Message
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Support Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📝 Clear Description</h4>
                <p className="text-muted-foreground">Describe your issue clearly and provide relevant details.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🖼️ Screenshots</h4>
                <p className="text-muted-foreground">Upload screenshots to help us understand your problem better.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏱️ Response Time</h4>
                <p className="text-muted-foreground">Our team typically responds within 1-2 hours.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
