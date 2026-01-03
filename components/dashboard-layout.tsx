"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ThemeSwitcher } from "./theme-switcher"
import { logoutAction } from "@/app/actions/auth"
import { Users, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    username: string
    email: string
    balance: number
    isAdmin?: boolean
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [activeUsers, setActiveUsers] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const baseCount = Math.floor(Math.random() * 150) + 50
    setActiveUsers(baseCount)

    const interval = setInterval(
      () => {
        setActiveUsers((prev) => {
          const change = Math.floor(Math.random() * 10) - 4
          const newCount = Math.max(20, Math.min(300, prev + change))
          return newCount
        })
      },
      5000 + Math.random() * 5000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logoutAction()
  }

  const handleMobileNavigate = () => {
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Desktop Sidebar - always visible on md+ screens */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-64">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar - controlled by Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar user={user} onLogout={handleLogout} onNavigate={handleMobileNavigate} />
        </SheetContent>
      </Sheet>

      <main className="md:ml-64">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            {/* Mobile menu button - single click opens sidebar */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </Button>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {/* Active users indicator */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs sm:text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <Users size={14} className="hidden sm:block" />
                <span>{activeUsers.toLocaleString()} online</span>
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">{children}</div>
      </main>
    </div>
  )
}
