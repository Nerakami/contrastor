import { DashboardNav } from "@/components/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import CreateGroupForm from "@/components/create-group-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function NewGroupPage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", user?.id).single()

    const userProfile = profile || {
      id: user?.id || "",
      email: user?.email || "",
      full_name: user?.user_metadata?.full_name || "",
      avatar_url: user?.user_metadata?.avatar_url || "",
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={userProfile} />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <CreateGroupForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading new group page:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Error</h1>
          <p className="text-muted-foreground mb-4">Unable to load the page.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }
}
