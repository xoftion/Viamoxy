import { getServicesWithMarkup } from "@/lib/cloutflash"
import { ServicesClient } from "./services-client"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const services = await getServicesWithMarkup()

  // Group services by category
  const categories = [...new Set(services.map((s) => s.category))]

  return <ServicesClient services={services} categories={categories} />
}
