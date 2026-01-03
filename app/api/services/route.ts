import { NextResponse } from "next/server"
import { getServicesWithMarkup } from "@/lib/cloutflash"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const services = await getServicesWithMarkup()

    if (!services || services.length === 0) {
      console.log("No services returned from CloutFlash API")
      return NextResponse.json({ success: true, data: [] })
    }

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    console.error("Failed to fetch services:", error)
    return NextResponse.json({ success: true, data: [] })
  }
}
