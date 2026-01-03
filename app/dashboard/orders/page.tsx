import { getSession } from "@/lib/session"
import { getOrdersByUserId } from "@/lib/db"
import { OrdersClient } from "./orders-client"

export default async function OrdersPage() {
  const session = await getSession()
  if (!session) {
    return null
  }

  const orders = await getOrdersByUserId(session.userId)

  return <OrdersClient orders={orders} />
}
