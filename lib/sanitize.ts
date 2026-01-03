// Input sanitization utilities
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeUsername(username: string): string {
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, "")
}

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.toString()
  } catch {
    return url.trim()
  }
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "").substring(0, 1000)
}
