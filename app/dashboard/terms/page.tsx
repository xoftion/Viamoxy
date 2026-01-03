import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using STABOOST, you accept and agree to be bound by the terms and provision of this
            agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>

          <h3>2. Description of Service</h3>
          <p>
            STABOOST provides social media marketing services including but not limited to followers, likes, views, and
            engagement services for various social media platforms. We act as a reseller and intermediary between you
            and our service providers.
          </p>

          <h3>3. User Responsibilities</h3>
          <ul>
            <li>You must be at least 18 years old to use our services</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You agree not to use our services for any illegal purposes</li>
            <li>You must provide accurate and complete information when creating an account</li>
          </ul>

          <h3>4. Payment and Refunds</h3>
          <p>
            All payments are processed securely. Refunds are provided on a case-by-case basis for orders that fail to
            deliver. Partial refunds may be issued for partially completed orders. No refunds are provided for completed
            orders.
          </p>

          <h3>5. Service Delivery</h3>
          <p>
            Delivery times vary by service and are estimates only. We are not responsible for delays caused by factors
            outside our control. Services are subject to availability and platform policies.
          </p>

          <h3>6. No Guarantee</h3>
          <p>
            While we strive to provide high-quality services, we cannot guarantee specific results or outcomes. Social
            media platforms may remove or adjust engagement at their discretion.
          </p>

          <h3>7. Limitation of Liability</h3>
          <p>
            STABOOST shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of our services.
          </p>

          <h3>8. Privacy</h3>
          <p>
            We respect your privacy and protect your personal information. We do not share your data with third parties
            except as necessary to provide our services.
          </p>

          <h3>9. Account Termination</h3>
          <p>
            We reserve the right to terminate or suspend your account at any time for violations of these terms or for
            any other reason at our sole discretion.
          </p>

          <h3>10. Changes to Terms</h3>
          <p>
            We may update these terms from time to time. Continued use of our services after changes constitutes
            acceptance of the new terms.
          </p>

          <h3>11. Contact</h3>
          <p>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:staboost.io@gmail.com" className="text-primary">
              staboost.io@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
