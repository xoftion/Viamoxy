export const dynamic = "force-dynamic"

const SUPPORT_CONTEXT = `You are a helpful support assistant for STABOOST, a Nigerian social media marketing (SMM) panel.

Services: We provide Instagram, TikTok, Facebook, YouTube, Twitter, Telegram, Spotify followers, likes, views, and engagement services.

Pricing: Services are priced in Nigerian Naira (₦). Prices vary by service, typically starting from ₦50-100 per 1000.

How to Order:
1. Fund your wallet via bank transfer or crypto (USDT/TON)
2. Go to "New Order" page
3. Select service category and specific service
4. Enter link and quantity
5. Confirm order

Payments: Bank transfer to OPAY account or crypto deposits. Minimum deposit is ₦1,000. Deposits require admin approval.

Order Status: Track orders in "Order History". Most orders start within 0-24 hours.

Support: Email staboost.io@gmail.com for urgent issues.

Keep responses concise, friendly, and helpful. If you don't know something specific, suggest contacting support via email.`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error("[v0] OPENROUTER_API_KEY not set")
      return Response.json({ error: "AI service not configured. Please contact support." }, { status: 500 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "auto",
        messages: [
          { role: "system", content: SUPPORT_CONTEXT },
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] OpenRouter API error:", response.status, errorData)
      return Response.json({ error: "AI service error. Please try again or contact support." }, { status: 500 })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[v0] Unexpected OpenRouter response:", data)
      return Response.json({ error: "Invalid response from AI service." }, { status: 500 })
    }

    return Response.json({ response: data.choices[0].message.content })
  } catch (error) {
    console.error("[v0] AI support error:", error)
    return Response.json(
      { error: "Sorry, I'm having trouble connecting right now. Please submit a ticket for help." },
      { status: 500 },
    )
  }
}
