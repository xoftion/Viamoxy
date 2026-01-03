import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import {
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Star,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  ArrowRight,
  CheckCircle,
  Rocket,
  Globe,
  Award,
  BarChart3,
  ThumbsUp,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Get your orders started within minutes of placing them.",
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Your accounts are safe with our premium quality services.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our support team is available around the clock to help you.",
  },
  {
    icon: TrendingUp,
    title: "Real Growth",
    description: "Organic-looking growth that boosts your social presence.",
  },
  {
    icon: Award,
    title: "Premium Services",
    description: "Access to exclusive premium SMM services and features.",
  },
  {
    icon: BarChart3,
    title: "Analytics Ready",
    description: "All services are designed to boost your real metrics.",
  },
  {
    icon: Rocket,
    title: "Fastest in Nigeria",
    description: "The quickest turnaround time for all social media services.",
  },
  {
    icon: CheckCircle,
    title: "Money Back Guarantee",
    description: "If not satisfied, we offer a full refund within 30 days.",
  },
]

const platforms = [
  { icon: Instagram, name: "Instagram", color: "text-pink-500" },
  { icon: Facebook, name: "Facebook", color: "text-blue-600" },
  { icon: Youtube, name: "YouTube", color: "text-red-500" },
  { icon: Twitter, name: "Twitter", color: "text-sky-500" },
]

const pricingHighlights = [
  {
    platform: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    services: [
      { name: "Views", price: "₦450" },
      { name: "Likes", price: "₦600" },
      { name: "Followers", price: "₦2,800" },
    ],
  },
  {
    platform: "TikTok",
    icon: Twitter,
    color: "text-black dark:text-white",
    services: [
      { name: "Views", price: "₦400" },
      { name: "Likes", price: "₦650" },
      { name: "Followers", price: "₦6,500" },
    ],
  },
  {
    platform: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    services: [
      { name: "Views", price: "₦450" },
      { name: "Likes", price: "₦3,200" },
      { name: "Followers", price: "₦1,500" },
    ],
  },
  {
    platform: "YouTube",
    icon: Youtube,
    color: "text-red-500",
    services: [
      { name: "Views", price: "₦4,800" },
      { name: "Likes", price: "₦2,500" },
      { name: "Subscribers", price: "₦700" },
    ],
  },
]

const testimonials = [
  {
    name: "Chioma A.",
    location: "Lagos, Nigeria",
    text: "STABOOST helped me grow my Instagram following from 1k to 50k in just 3 months. Amazing service and cheap prices!",
    role: "Content Creator",
  },
  {
    name: "Emeka O.",
    location: "Abuja, Nigeria",
    text: "Fast delivery, great prices, and excellent support. I've been using STABOOST for all my clients' accounts.",
    role: "Social Media Manager",
  },
  {
    name: "Zainab M.",
    location: "Kano, Nigeria",
    text: "Best SMM panel I've used in Nigeria. The support team is responsive and the service quality is unmatched.",
    role: "Business Owner",
  },
  {
    name: "Tosin B.",
    location: "Ibadan, Nigeria",
    text: "Started using STABOOST last month and I'm already seeing real results. Would recommend to everyone.",
    role: "YouTuber",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#platforms" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Platforms
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/pricelist" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap size={16} />
              #1 SMM Panel in Nigeria
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">
              Boost Your Social Media <span className="text-primary">Presence</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground text-pretty md:text-xl">
              Get real followers, likes, views, and engagement across all major social platforms. Cheapest prices in
              Nigeria starting from just ₦400/1K.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Growing Now
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/pricelist">
                <Button size="lg" variant="outline">
                  View Full Pricelist
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <p className="text-3xl font-bold text-primary md:text-4xl">3k+</p>
              <p className="text-sm text-muted-foreground">Orders Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary md:text-4xl">400+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary md:text-4xl">151+</p>
              <p className="text-sm text-muted-foreground">Services Available</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary md:text-4xl">46%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why STABOOST Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why STABOOST is Different</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We're not just another SMM panel. We're committed to delivering real results with transparency and
              excellence.
            </p>
          </div>
          <div className="mx-auto max-w-3xl grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="p-6">
                <Globe size={32} className="mb-4 text-primary" />
                <h3 className="mb-2 font-semibold">Trusted by Thousands</h3>
                <p className="text-sm text-muted-foreground">
                  Join over 400 satisfied customers across Nigeria using STABOOST daily.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="p-6">
                <Rocket size={32} className="mb-4 text-primary" />
                <h3 className="mb-2 font-semibold">Super Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Most orders start within 5 minutes. Get guaranteed results in record time.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="p-6">
                <ThumbsUp size={32} className="mb-4 text-primary" />
                <h3 className="mb-2 font-semibold">Money Back Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  Not satisfied? We offer a full refund within 1 days, no questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose STABOOST?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We provide the fastest and most reliable SMM services to help you grow your social media presence.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-card shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Supported Platforms</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We support all major social media platforms to help you grow everywhere.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {platforms.map((platform, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted transition-all hover:scale-110">
                  <platform.icon size={40} className={platform.color} />
                </div>
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <span className="text-2xl font-bold text-muted-foreground">+20</span>
              </div>
              <span className="text-sm font-medium">More</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Cheapest Prices in Nigeria</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              All prices are per 1,000 units. No hidden fees, no minimum orders.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingHighlights.map((platform, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 border-b bg-muted/50 p-4">
                    <platform.icon size={24} className={platform.color} />
                    <h3 className="font-bold">{platform.platform}</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      {platform.services.map((service, sIndex) => (
                        <li key={sIndex} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{service.name}</span>
                          <span className="font-semibold text-primary">{service.price}/1K</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/pricelist">
              <Button variant="outline" className="gap-2 bg-transparent">
                View Full Pricelist
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">What Our Customers Say</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Join thousands of satisfied users who have transformed their social media presence with STABOOST.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="mb-2 font-semibold">Create Account</h3>
              <p className="text-sm text-muted-foreground">Sign up for free and add funds to your wallet in seconds.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="mb-2 font-semibold">Choose Service</h3>
              <p className="text-sm text-muted-foreground">Select from 150+ services across all major platforms.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="mb-2 font-semibold">Watch It Grow</h3>
              <p className="text-sm text-muted-foreground">Get real results delivered fast with instant support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Boost Your Social Media?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Join thousands of satisfied customers and start growing today. It takes less than 2 minutes to get started.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Logo size="sm" />
              <p className="mt-4 text-sm text-muted-foreground">
                The #1 SMM Panel in Nigeria for all your social media marketing needs.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instagram</li>
                <li>Facebook</li>
                <li>YouTube</li>
                <li>TikTok</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/pricelist" className="hover:text-foreground">
                    Pricelist
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Contact</h4>
              <p className="text-sm text-muted-foreground">Email: staboost.io@gmail.com</p>
              <p className="mt-2 text-sm text-muted-foreground">Support available 24/7</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} STABOOST. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
