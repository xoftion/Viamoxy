"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, RefreshCw, Clock, Zap } from "lucide-react"
import type { Service } from "@/lib/types"

interface ServiceCardProps {
  service: Service & { markedUpRate: string }
  onOrder: (service: Service & { markedUpRate: string }) => void
}

export function ServiceCard({ service, onOrder }: ServiceCardProps) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-sm font-medium leading-tight">{service.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {service.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {service.refill && (
            <Badge variant="outline" className="gap-1 text-xs">
              <RefreshCw size={12} />
              Refill
            </Badge>
          )}
          {service.dripfeed && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Clock size={12} />
              Drip-feed
            </Badge>
          )}
          <Badge variant="outline" className="gap-1 text-xs">
            <Zap size={12} />
            {service.type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Min:</span> {service.min}
          </div>
          <div>
            <span className="font-medium">Max:</span> {service.max}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Price per 1000</p>
            <p className="text-lg font-bold text-primary">${service.markedUpRate}</p>
          </div>
          <Button size="sm" onClick={() => onOrder(service)} className="gap-1">
            <ShoppingCart size={16} />
            Order
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
