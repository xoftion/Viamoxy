"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Send, Mail, Clock, CheckCircle, MessageCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  subject: string
  category: string
  status: "open" | "pending" | "resolved"
  createdAt: string
}

export function SupportClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject || !category || !message) return

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newTicket: SupportTicket = {
      id: Math.random().toString(36).substring(2),
      subject,
      category,
      status: "open",
      createdAt: new Date().toISOString(),
    }

    setTickets((prev) => [newTicket, ...prev])
    setSubject("")
    setCategory("")
    setMessage("")
    setIsSubmitting(false)

    toast.success("Ticket submitted successfully! We'll respond via email.")
  }

  async function handleChatSend() {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      if (data.response) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }])
      } else {
        throw new Error("No response")
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please submit a ticket for help.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Support</h1>
        <p className="text-muted-foreground">Get help from our AI assistant or support team</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Chat Support */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              AI Support Assistant
            </CardTitle>
            <CardDescription>Get instant answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            {!chatOpen ? (
              <Button onClick={() => setChatOpen(true)} className="w-full gap-2">
                <MessageCircle size={16} />
                Start Chat with AI
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="h-[300px] overflow-y-auto rounded-lg border bg-muted/30 p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Hi! I'm your AI assistant. Ask me about orders, payments, or services.
                    </p>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    disabled={chatLoading}
                  />
                  <Button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket size={20} />
              Open New Ticket
            </CardTitle>
            <CardDescription>For complex issues, our team will get back to you within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="payment">Payment Problem</SelectItem>
                    <SelectItem value="refund">Refund Request</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={16} />
                    Submit Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">{ticket.category}</p>
                    </div>
                    <Badge variant={ticket.status === "resolved" ? "default" : "secondary"} className="shrink-0 gap-1">
                      {ticket.status === "open" && <Clock size={12} />}
                      {ticket.status === "resolved" && <CheckCircle size={12} />}
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Opened {formatDate(ticket.createdAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div>
            <h3 className="font-semibold">Need urgent help?</h3>
            <p className="text-sm text-muted-foreground">
              Contact us directly at{" "}
              <a href="mailto:staboost.io@gmail.com" className="text-primary hover:underline">
                staboost.io@gmail.com
              </a>
            </p>
          </div>
          <a href="mailto:staboost.io@gmail.com">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Mail size={16} />
              Email Support
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
