const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  limit = 100,
  windowMs = 60000,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime }
}

export function checkRateLimit(
  identifier: string,
  action: string,
  limit = 10,
  windowMs = 60000,
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${action}:${identifier}`
  return rateLimit(key, limit, windowMs)
}

export function getRateLimitStatus(identifier: string): { remaining: number; resetTime: number } {
  const record = rateLimitMap.get(identifier)
  if (!record) {
    return { remaining: 100, resetTime: Date.now() + 60000 }
  }
  return { remaining: Math.max(0, 100 - record.count), resetTime: record.resetTime }
}
