"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Save email content
export async function saveEmailContent(emailId: string, content: any) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to save content" }
    }

    // Update the email content
    const { error } = await supabase
      .from("emails")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", emailId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Save content error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Save HTML/CSS content for code editor
export async function saveCodeContent(emailId: string, htmlContent: string, cssContent: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to save content" }
    }

    // Update the email content
    const { error } = await supabase
      .from("emails")
      .update({
        html_content: htmlContent,
        css_content: cssContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", emailId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Save code content error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
