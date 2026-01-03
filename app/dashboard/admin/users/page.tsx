import { Suspense } from "react"
import { UsersClient } from "./users-client"

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading users...</div>}>
      <UsersClient />
    </Suspense>
  )
}
