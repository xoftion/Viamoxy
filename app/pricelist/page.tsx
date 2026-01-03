import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { pricelistData } from "@/lib/pricing"
import { ArrowRight, Instagram, Facebook, Youtube, Twitter, Music, Hash, Send } from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-5 w-5 text-pink-500" />,
  TikTok: <Music className="h-5 w-5 text-black dark:text-white" />,
  Facebook: <Facebook className="h-5 w-5 text-blue-600" />,
  YouTube: <Youtube className="h-5 w-5 text-red-500" />,
  "Twitter/X": <Twitter className="h-5 w-5 text-sky-500" />,
  Telegram: <Send className="h-5 w-5 text-blue-400" />,
  Spotify: <Music className="h-5 w-5 text-green-500" />,
  Threads: <Hash className="h-5 w-5 text-black dark:text-white" />,
}

const categoryColors: Record<string, string> = {
  Instagram: "from-pink-500/20 to-purple-500/20 border-pink-500/30",
  TikTok: "from-gray-500/20 to-black/20 border-gray-500/30",
  Facebook: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  YouTube: "from-red-500/20 to-red-600/20 border-red-500/30",
  "Twitter/X": "from-sky-400/20 to-sky-500/20 border-sky-500/30",
  Telegram: "from-blue-400/20 to-blue-500/20 border-blue-400/30",
  Spotify: "from-green-500/20 to-green-600/20 border-green-500/30",
  Threads: "from-gray-400/20 to-gray-500/20 border-gray-400/30",
}

export default function PricelistPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/#platforms" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Platforms
            </Link>
            <Link href="/pricelist" className="text-sm font-medium text-primary">
              Pricelist
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            Our <span className="text-primary">Pricelist</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Affordable prices for all your social media growth needs. All prices are in Nigerian Naira (₦) per 1,000
            units.
          </p>
        </div>
      </section>

      {/* Pricelist */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {pricelistData.map((category) => (
              <Card
                key={category.category}
                className={`overflow-hidden border bg-gradient-to-br ${categoryColors[category.category] || "from-gray-500/20 to-gray-600/20 border-gray-500/30"}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    {categoryIcons[category.category]}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 backdrop-blur-sm"
                      >
                        <span className="text-sm">{service.name}</span>
                        <span className="font-semibold text-primary">
                          ₦{service.price.toLocaleString()}/{service.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">Ready to start growing your social media presence?</p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Now
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} STABOOST. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
