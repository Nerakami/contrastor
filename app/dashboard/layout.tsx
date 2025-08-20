import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Auth error in dashboard layout:", error)
      redirect("/auth/login")
    }

    if (!user) {
      redirect("/auth/login")
    }

    return <>{children}</>
  } catch (error) {
    console.error("[v0] Network error in dashboard layout:", error)
    // Instead of redirecting, show an error message
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p className="text-muted-foreground mb-4">Unable to connect to the authentication service.</p>
          <a href="/auth/login" className="text-primary hover:underline">
            Try logging in again
          </a>
        </div>
      </div>
    )
  }
}
