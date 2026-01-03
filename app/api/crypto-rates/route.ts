export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=toncoin,tether&vs_currencies=ngn", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch crypto rates")
    }

    const data = await response.json()

    return Response.json(
      {
        usdt: data.tether?.ngn || 1650,
        ton: data.toncoin?.ngn || 2000,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Failed to fetch crypto rates:", error)
    // Return fallback rates if API fails
    return Response.json(
      { usdt: 1650, ton: 2000 },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    )
  }
}
