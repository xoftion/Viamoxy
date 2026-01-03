import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Code, Key, Terminal, Shield } from "lucide-react"

export default function APIDocsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12 px-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Reseller API Documentation</h1>
        <p className="mt-2 text-muted-foreground">Integrate STABOOST services into your own platform</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            API Access Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To use the STABOOST Reseller API, you need to purchase an API subscription from your{" "}
            <a href="/dashboard/settings" className="text-primary hover:underline font-medium">
              Settings
            </a>{" "}
            page. Plans start from ₦5,080/month.
          </p>
          <p className="text-sm text-muted-foreground">After purchasing, generate your API key to start integrating.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>All API requests must include your API key in the request body.</p>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Base Endpoint:</p>
            <code className="text-sm">POST https://staboost.name.ng/api/resell/v1</code>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: Replace staboost.name.ng with the actual deployed domain
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal size={20} />
            API Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Services */}
          <div>
            <h3 className="mb-2 font-semibold">Get Services</h3>
            <p className="text-sm text-muted-foreground mb-2">Retrieve all available services with pricing</p>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm">
                {`{
  "key": "YOUR_API_KEY",
  "action": "services"
}`}
              </pre>
            </div>
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium mb-1">Response:</p>
              <pre className="text-xs">
                {`[
  {
    "service": "123",
    "name": "Instagram Followers",
    "rate": "2800.00",
    "min": "10",
    "max": "100000"
  }
]`}
              </pre>
            </div>
          </div>

          {/* Balance */}
          <div>
            <h3 className="mb-2 font-semibold">Get Balance</h3>
            <p className="text-sm text-muted-foreground mb-2">Check your account balance</p>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm">
                {`{
  "key": "YOUR_API_KEY",
  "action": "balance"
}`}
              </pre>
            </div>
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium mb-1">Response:</p>
              <pre className="text-xs">
                {`{
  "balance": "15000.50",
  "currency": "NGN"
}`}
              </pre>
            </div>
          </div>

          {/* Add Order */}
          <div>
            <h3 className="mb-2 font-semibold">Place Order</h3>
            <p className="text-sm text-muted-foreground mb-2">Create a new order</p>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm">
                {`{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": "123",
  "link": "https://instagram.com/username",
  "quantity": 1000
}`}
              </pre>
            </div>
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium mb-1">Response:</p>
              <pre className="text-xs">
                {`{
  "order": "12345"
}`}
              </pre>
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="mb-2 font-semibold">Check Order Status</h3>
            <p className="text-sm text-muted-foreground mb-2">Get the status of an order</p>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm">
                {`{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": "12345"
}`}
              </pre>
            </div>
            <div className="mt-2 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium mb-1">Response:</p>
              <pre className="text-xs">
                {`{
  "charge": "2800",
  "start_count": "1200",
  "status": "Completed",
  "remains": "0"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Rate Limits & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Maximum 100 requests per minute per API key</li>
            <li>Exceeding limits returns HTTP 429 error</li>
            <li>Always check balance before placing orders</li>
            <li>Validate service IDs before submitting orders</li>
            <li>Keep your API key secure and never share it publicly</li>
            <li>Contact support for higher limits or custom requirements</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle>Support & Contact</CardTitle>
          <CardDescription>
            For API questions, technical support, or subscription inquiries, contact us at{" "}
            <a href="mailto:staboost.io@gmail.com" className="text-primary hover:underline">
              staboost.io@gmail.com
            </a>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
