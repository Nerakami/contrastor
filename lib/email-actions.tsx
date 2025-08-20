"use server"

import { createClient } from "@/lib/supabase/server"

export async function createFolder(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const groupId = formData.get("groupId")

  if (!name || !groupId) {
    return { error: "Name and group are required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a folder" }
    }

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You must be a member of this group to create folders" }
    }

    // Create the folder
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .insert({
        name: name.toString(),
        group_id: groupId.toString(),
        created_by: user.id,
      })
      .select()
      .single()

    if (folderError) {
      return { error: folderError.message }
    }

    return { success: true, folderId: folder.id }
  } catch (error) {
    console.error("Folder creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function createEmail(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const groupId = formData.get("groupId")
  const folderId = formData.get("folderId")
  const editorType = formData.get("editorType")

  if (!name || !groupId || !editorType) {
    return { error: "Name, group, and editor type are required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create an email" }
    }

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You must be a member of this group to create emails" }
    }

    // Create the email
    const { data: email, error: emailError } = await supabase
      .from("emails")
      .insert({
        name: name.toString(),
        group_id: groupId.toString(),
        folder_id: folderId && folderId !== "none" ? folderId.toString() : null,
        editor_type: editorType.toString(),
        created_by: user.id,
        content: editorType === "drag-drop" ? [] : null,
        html_content: editorType === "code" ? "<h1>Welcome to your email!</h1>" : null,
        css_content: editorType === "code" ? "body { font-family: Arial, sans-serif; }" : null,
      })
      .select()
      .single()

    if (emailError) {
      return { error: emailError.message }
    }

    return { success: true, emailId: email.id }
  } catch (error) {
    console.error("Email creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
