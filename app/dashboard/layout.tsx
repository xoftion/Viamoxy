import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>
}
