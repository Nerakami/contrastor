"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"

// Create a new group
export async function createGroup(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")

  if (!name) {
    return { error: "Group name is required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a group" }
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      // Create the missing user profile
      const { error: createProfileError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || "",
      })

      if (createProfileError) {
        return { error: "Failed to create user profile. Please contact support." }
      }
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: name.toString(),
        description: description?.toString() || "",
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      return { error: groupError.message }
    }

    // Add the creator as an admin member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "admin",
    })

    if (memberError) {
      return { error: memberError.message }
    }

    return { success: true, groupId: group.id }
  } catch (error) {
    console.error("Group creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Invite user to group
export async function inviteToGroup(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const groupId = formData.get("groupId")

  if (!email || !groupId) {
    return { error: "Email and group ID are required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to send invitations" }
    }

    // Check if user is admin of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (!membership || membership.role !== "admin") {
      return { error: "You must be an admin to invite users" }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return { error: "User is already a member of this group" }
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from("group_invitations")
      .select("id")
      .eq("group_id", groupId.toString())
      .eq("email", email.toString())
      .is("accepted_at", null)
      .single()

    if (existingInvitation) {
      return { error: "An invitation has already been sent to this email" }
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    // Create invitation
    const { error: invitationError } = await supabase.from("group_invitations").insert({
      group_id: groupId.toString(),
      email: email.toString(),
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (invitationError) {
      return { error: invitationError.message }
    }

    // TODO: Send email invitation (would integrate with email service)
    console.log(`Invitation sent to ${email} with token: ${token}`)

    return { success: "Invitation sent successfully!" }
  } catch (error) {
    console.error("Invitation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Accept group invitation
export async function acceptInvitation(token: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .single()

    if (invitationError || !invitation) {
      return { error: "Invalid or expired invitation" }
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { error: "This invitation has expired" }
    }

    // Add user to group
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: invitation.group_id,
      user_id: user.id,
      role: "member",
      invited_by: invitation.invited_by,
    })

    if (memberError) {
      return { error: memberError.message }
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from("group_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id)

    if (updateError) {
      return { error: updateError.message }
    }

    redirect(`/dashboard/groups/${invitation.group_id}`)
  } catch (error) {
    console.error("Accept invitation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Remove member from group
export async function removeMember(groupId: string, userId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in" }
    }

    // Check if current user is admin
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single()

    if (!membership || membership.role !== "admin") {
      return { error: "You must be an admin to remove members" }
    }

    // Remove the member
    const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId)

    if (error) {
      return { error: error.message }
    }

    return { success: "Member removed successfully" }
  } catch (error) {
    console.error("Remove member error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
