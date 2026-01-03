import { Suspense } from "react"
import { OrdersClient } from "./orders-client"

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading orders...</div>}>
      <OrdersClient />
    </Suspense>
  )
}
