import { neon } from "@neondatabase/serverless"
import { getServicesWithMarkup, placeOrder, getOrderStatus, calculateCostNgn } from "@/lib/cloutflash"
import { createOrder, updateUserBalance, createTransaction } from "@/lib/db"

export const runtime = "edge"
export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit = 100): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

async function validateApiKey(apiKey: string) {
  try {
    const result = await sql`SELECT id, username, balance, is_admin FROM users WHERE api_key = ${apiKey}`
    if (result.length === 0) return null
    return {
      id: result[0].id.toString(),
      username: result[0].username,
      balance: Number.parseFloat(result[0].balance),
      isAdmin: result[0].is_admin || false,
    }
  } catch (error) {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, action } = body

    if (!key || !action) {
      return Response.json({ error: "Missing required parameters: key, action" }, { status: 400 })
    }

    if (!checkRateLimit(`api:${key}`, 100)) {
      return Response.json({ error: "Rate limit exceeded. Max 100 requests per minute." }, { status: 429 })
    }

    const user = await validateApiKey(key)
    if (!user) {
      return Response.json({ error: "Invalid API key" }, { status: 401 })
    }

    switch (action) {
      case "services": {
        const services = await getServicesWithMarkup()
        return Response.json(services)
      }

      case "balance": {
        return Response.json({
          balance: user.balance.toFixed(2),
          currency: "NGN",
        })
      }

      case "add": {
        const { service, link, quantity } = body

        if (!service || !link || !quantity) {
          return Response.json({ error: "Missing required parameters: service, link, quantity" }, { status: 400 })
        }

        const services = await getServicesWithMarkup()
        const serviceData = services.find((s) => s.service === Number.parseInt(service))

        if (!serviceData) {
          return Response.json({ error: "Invalid service ID" }, { status: 400 })
        }

        const cost = calculateCostNgn(Number.parseFloat(serviceData.markedUpRate), Number.parseInt(quantity))

        if (user.balance < cost) {
          return Response.json({ error: "Insufficient balance" }, { status: 400 })
        }

        const providerOrder = await placeOrder(Number.parseInt(service), link, Number.parseInt(quantity))

        await updateUserBalance(user.id, user.balance - cost)

        const order = await createOrder(
          user.id,
          service,
          serviceData.name,
          link,
          Number.parseInt(quantity),
          cost,
          providerOrder.order.toString(),
        )

        await createTransaction(user.id, "order", cost, `Order ${serviceData.name}`, "completed")

        return Response.json({
          order: order?.id,
          charge: cost.toFixed(2),
          currency: "NGN",
        })
      }

      case "status": {
        const { order } = body

        if (!order) {
          return Response.json({ error: "Missing required parameter: order" }, { status: 400 })
        }

        const orderResult = await sql`
          SELECT provider_order_id, status FROM orders WHERE id = ${Number.parseInt(order)} AND user_id = ${Number.parseInt(user.id)}
        `

        if (orderResult.length === 0) {
          return Response.json({ error: "Order not found" }, { status: 404 })
        }

        const providerOrderId = orderResult[0].provider_order_id

        if (!providerOrderId) {
          return Response.json({ error: "Order tracking not available" }, { status: 400 })
        }

        const status = await getOrderStatus(Number.parseInt(providerOrderId))

        return Response.json({
          status: status.status,
          charge: status.charge,
          start_count: status.start_count,
          remains: status.remains,
        })
      }

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
