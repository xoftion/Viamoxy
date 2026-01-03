import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "STABOOST - SMM Panel",
  description: "Premium Social Media Marketing Services - Boost your social presence with STABOOST",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/images/staboost-logo.jpeg",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "/images/staboost-logo.jpeg",
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    apple: "/images/staboost-logo.jpeg",
    shortcut: "/images/staboost-logo.jpeg",
  },
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('ResizeObserver') || e.message.includes('ResizeObserver loop'))) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return false;
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" storageKey="staboost-theme">
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
