"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, RefreshCw, Clock, ShoppingCart } from "lucide-react"
import type { Service } from "@/lib/types"

interface ServicesClientProps {
  services: (Service & { markedUpRate: string })[]
  categories: string[]
}

export function ServicesClient({ services, categories }: ServicesClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, search, selectedCategory])

  const handleOrder = (serviceId: number) => {
    router.push(`/dashboard/new-order?service=${serviceId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Services</h1>
        <p className="text-muted-foreground">Browse all available SMM services</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.length}</p>
              <p className="text-sm text-muted-foreground">Total Services</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <RefreshCw size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.filter((s) => s.refill).length}</p>
              <p className="text-sm text-muted-foreground">With Refill</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Clock size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.filter((s) => s.dripfeed).length}</p>
              <p className="text-sm text-muted-foreground">Drip-feed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredServices.length} Services Found</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                  <TableHead className="text-center">Max</TableHead>
                  <TableHead className="text-right">Rate/1K</TableHead>
                  <TableHead className="text-center">Features</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No services found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.service}>
                      <TableCell className="font-mono text-xs">{service.service}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium">{service.name}</p>
                          {service.desc && <p className="line-clamp-1 text-xs text-muted-foreground">{service.desc}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{service.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{service.min}</TableCell>
                      <TableCell className="text-center">{service.max}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        ₦{Number(service.markedUpRate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {service.refill && (
                            <Badge variant="outline" className="text-xs">
                              <RefreshCw size={10} className="mr-1" />
                              Refill
                            </Badge>
                          )}
                          {service.dripfeed && (
                            <Badge variant="outline" className="text-xs">
                              <Clock size={10} className="mr-1" />
                              Drip
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleOrder(service.service)} className="gap-1">
                          <ShoppingCart size={14} />
                          Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
