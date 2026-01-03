export interface User {
  id: string
  email: string
  username: string
  password: string // hashed password stored with user
  balance: number
  isAdmin: boolean // Added admin flag
  createdAt: string
}

export interface Service {
  service: number
  name: string
  type: string
  category: string
  rate: string
  min: string
  max: string
  refill: boolean
  cancel: boolean
  dripfeed?: boolean
  desc?: string
}

export interface ServiceWithMarkup extends Service {
  originalRate: string
  markedUpRate: string
}

export interface Order {
  id: string
  orderId?: string
  serviceId: number
  serviceName: string
  link: string
  quantity: number
  charge: number
  status: "pending" | "processing" | "in_progress" | "completed" | "partial" | "cancelled" | "refunded"
  startCount?: number
  remains?: number
  createdAt: string
}

export interface WalletTransaction {
  id: string
  type: "deposit" | "order" | "refund"
  amount: number
  description: string
  createdAt: string
  balanceAfter: number
}

export interface SessionData {
  user: Omit<User, "password"> | null
  orders: Order[]
  transactions: WalletTransaction[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface CloutFlashOrder {
  order: number
}

export interface CloutFlashStatus {
  charge: string
  start_count: string
  status: string
  remains: string
  currency: string
}

export interface CloutFlashBalance {
  balance: string
  currency: string
}

export type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string }

export type ActionResultVoid = ActionResult<void>
