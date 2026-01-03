"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  Wallet,
  HelpCircle,
  LogOut,
  User,
  Ticket,
  FileText,
  ChevronDown,
  Sparkles,
  Shield,
  CreditCard,
  Zap,
  MessageCircle,
  Newspaper,
} from "lucide-react"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface SidebarProps {
  user: {
    username: string
    email: string
    balance: number
    isAdmin?: boolean
  }
  onLogout: () => void
  onNavigate?: () => void
}

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/new-order", icon: ShoppingCart, label: "New Order", highlight: true },
  { href: "/dashboard/services", icon: Package, label: "Services" },
  { href: "/dashboard/orders", icon: History, label: "Order History" },
  { href: "/dashboard/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/dashboard/add-funds", icon: Wallet, label: "Add Funds" },
  { href: "/dashboard/settings", icon: User, label: "Settings" },
]

const tierNavItems = [
  { href: "/dashboard/tier1", icon: Zap, label: "Tier 1", tier: 1 },
  { href: "/dashboard/tier2", icon: Zap, label: "Tier 2", tier: 2 },
  { href: "/dashboard/tier3", icon: Zap, label: "Tier 3", tier: 3 },
]

const adminNavItems = [{ href: "/dashboard/admin", icon: Shield, label: "Admin Panel" }]

const supportNavItems = [
  { href: "/dashboard/live-chat", icon: MessageCircle, label: "Live Chat" },
  { href: "/dashboard/tickets", icon: Ticket, label: "Support Tickets" },
  { href: "/dashboard/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/dashboard/terms", icon: FileText, label: "Terms of Service" },
]

export function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const [supportOpen, setSupportOpen] = useState(false)

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-card border-r border-border text-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Logo size="md" />
      </div>

      {/* User info */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              user.isAdmin
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-primary to-primary/60",
            )}
          >
            {user.isAdmin ? <Shield size={20} className="text-white" /> : <User size={20} className="text-white" />}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{user.username}</p>
              {user.isAdmin && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                  ADMIN
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
          <p className="text-xl font-bold text-primary">₦{user.balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  item.highlight && !isActive && "text-primary",
                )}
              >
                <item.icon size={20} />
                {item.label}
                {item.highlight && !isActive && <Sparkles size={14} className="ml-auto text-primary" />}
              </Link>
            )
          })}
        </div>

        <div className="mt-4">
          <Link
            href="/blog"
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/blog"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            <Newspaper size={20} />
            Blog & Updates
          </Link>
        </div>

        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase text-blue-500">Upgrades</p>
          <div className="space-y-1">
            {tierNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const colorClass =
                item.tier === 3
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
              const hoverClass =
                item.tier === 3
                  ? "text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-500"
                  : "text-blue-500/80 hover:bg-blue-500/10 hover:text-blue-500"

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive ? colorClass : hoverClass,
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {user.isAdmin && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-amber-500">Admin</p>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                        : "text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-500",
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Support section */}
        <Collapsible open={supportOpen} onOpenChange={setSupportOpen} className="mt-6">
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} />
              Support
            </div>
            <ChevronDown size={16} className={cn("transition-transform duration-200", supportOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1 pl-4">
            {supportNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-foreground/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          onClick={onLogout}
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </aside>
  )
}
