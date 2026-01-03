import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12 px-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to STABOOST ("we", "our", "us"). We operate the website staboost.name.ng and provide social media
            marketing services. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
          <p>
            By using STABOOST, you agree to the collection and use of information in accordance with this policy. If you
            do not agree with our policies and practices, do not use our services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Email address and username when you create an account</li>
              <li>Payment information and transaction history</li>
              <li>Social media links you provide for service delivery</li>
              <li>Communication records when you contact support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Usage data and interaction with our services</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We use the collected information for:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Providing and maintaining our services</li>
            <li>Processing your orders and transactions</li>
            <li>Sending service updates and promotional communications</li>
            <li>Improving our platform and customer experience</li>
            <li>Detecting and preventing fraud or security issues</li>
            <li>Complying with legal obligations</li>
            <li>Analyzing usage patterns to enhance our services</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure password hashing</li>
            <li>Regular security audits and monitoring</li>
            <li>Limited access to personal data by authorized personnel only</li>
            <li>Secure database infrastructure with Neon PostgreSQL</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
            to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Service Providers:</strong> Third-party service providers that help us deliver our SMM services
            </li>
            <li>
              <strong>Payment Processors:</strong> To process your transactions securely
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or asset sale
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Access your personal information we hold</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Object to processing of your personal information</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="text-sm">
            To exercise these rights, contact us at{" "}
            <a href="mailto:staboost.io@gmail.com" className="text-primary hover:underline">
              staboost.io@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We use cookies and similar tracking technologies to enhance your experience. Cookies are small data files
            stored on your device that help us:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Improve our services</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            You can control cookies through your browser settings. However, disabling cookies may affect your ability to
            use certain features of our platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We retain your personal information for as long as necessary to provide our services and comply with legal
            obligations. Specifically:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Account information is retained while your account is active</li>
            <li>Transaction records are kept for 7 years for tax and legal purposes</li>
            <li>Usage logs are retained for 90 days</li>
            <li>Deleted account data is permanently removed within 30 days</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
            information from children. If you believe we have inadvertently collected information from a child, please
            contact us immediately so we can delete it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Posting the new policy on this page</li>
            <li>Updating the "Last updated" date</li>
            <li>Sending you an email notification for significant changes</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            We encourage you to review this policy periodically for any changes. Your continued use of our services
            after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:staboost.io@gmail.com" className="text-primary hover:underline">
                staboost.io@gmail.com
              </a>
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <Link href="/" className="text-primary hover:underline">
                staboost.name.ng
              </Link>
            </p>
            <p>
              <strong>Support:</strong> Available 24/7 through our{" "}
              <Link href="/dashboard/tickets" className="text-primary hover:underline">
                Support Page
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
