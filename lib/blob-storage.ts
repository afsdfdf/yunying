import { put, del, list } from "@vercel/blob"

export interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

export async function uploadImage(file: File, projectId?: string): Promise<UploadedImage> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split(".").pop()
    const filename = `${projectId || "general"}/${timestamp}-${randomString}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deleteImage(filename: string): Promise<void> {
  try {
    await del(filename)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

export async function listImages(projectId?: string) {
  try {
    const { blobs } = await list({
      prefix: projectId ? `${projectId}/` : undefined,
    })
    return blobs
  } catch (error) {
    console.error("Error listing images:", error)
    throw new Error("Failed to list images")
  }
}
