import { Suspense } from "react"
import { getServicesWithMarkup } from "@/lib/cloutflash"
import { getSession } from "@/lib/session"
import { NewOrderClient } from "./new-order-client"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

function LoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default async function NewOrderPage() {
  const [services, session] = await Promise.all([getServicesWithMarkup(), getSession()])

  const categories = [...new Set(services.map((s) => s.category))]

  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewOrderClient services={services} categories={categories} balance={session.user?.balance || 0} />
    </Suspense>
  )
}
