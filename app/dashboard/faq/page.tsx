import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      'To place an order, navigate to "New Order" in the sidebar, select a service, enter the target link and quantity, then click "Place Order". The cost will be deducted from your balance automatically.',
  },
  {
    question: "How long does it take for orders to start?",
    answer:
      "Most orders start within a few minutes to a few hours after being placed. The exact time depends on the service type and current queue. You can check your order status in the Order History page.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Credit/Debit Cards, PayPal, and various cryptocurrencies. All payments are processed securely through our payment partners.",
  },
  {
    question: "Are the followers/likes real?",
    answer:
      "We offer various service types including real and high-quality engagements. Each service description indicates the type and quality of engagement you can expect.",
  },
  {
    question: "What happens if my order doesn't complete?",
    answer:
      "If an order fails to complete, you will receive a partial or full refund depending on how much was delivered. Contact our support team for any issues with your orders.",
  },
  {
    question: "Do you offer refills?",
    answer:
      'Many of our services come with refill guarantees. Services marked with "Refill" will automatically refill any drops within the guarantee period at no extra cost.',
  },
  {
    question: "Is my account safe?",
    answer:
      "Yes, we never ask for your passwords. We only need the link to your profile or post. All our services are designed to be safe and comply with platform guidelines.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can contact our support team by opening a ticket in the Support Tickets section or by emailing staboost.io@gmail.com. We respond to all inquiries within 24 hours.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "Orders can only be cancelled before processing begins. Once an order is in progress, it cannot be cancelled. Contact support immediately if you need to cancel an order.",
  },
  {
    question: "What is drip-feed?",
    answer:
      "Drip-feed allows you to spread the delivery of your order over a period of time, making the growth look more natural. You can specify the speed and duration when placing drip-feed enabled orders.",
  },
]

export default function FAQPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle size={20} />
            FAQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Still need help */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div>
            <h3 className="font-semibold">Still have questions?</h3>
            <p className="text-sm text-muted-foreground">Our support team is here to help you 24/7</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/tickets">
              <Button variant="outline">Open Ticket</Button>
            </Link>
            <a href="mailto:staboost.io@gmail.com">
              <Button className="gap-2">
                <Mail size={16} />
                Email Us
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
