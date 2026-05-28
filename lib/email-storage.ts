import { createClient } from "@/lib/supabase/client"

/**
 * Upload an image to Supabase Storage for use in emails
 * @param file - The image file to upload
 * @param emailId - The email ID to organize uploads
 * @returns The public URL of the uploaded image
 */
export async function uploadEmailImage(file: Blob, emailId: string): Promise<string> {
  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const extension = file.type.split("/")[1] || "png"
  const filename = `${emailId}/${timestamp}-${randomString}.${extension}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from("email-images").upload(filename, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload image")
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("email-images").getPublicUrl(data.path)

  return publicUrl
}

/**
 * Delete an email image from storage
 * @param url - The public URL of the image to delete
 */
export async function deleteEmailImage(url: string): Promise<void> {
  const supabase = createClient()

  // Extract path from URL
  const urlParts = url.split("/email-images/")
  if (urlParts.length < 2) return

  const path = urlParts[1]

  const { error } = await supabase.storage.from("email-images").remove([path])

  if (error) {
    console.error("Delete error:", error)
  }
}
