"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon } from "lucide-react"
import { uploadImage, type UploadedImage } from "@/lib/blob-storage"
import { saveImageToDatabase } from "@/lib/database"

interface ImageUploadProps {
  projectId?: string
  onImageUploaded?: (image: UploadedImage & { id: string }) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export default function ImageUpload({
  projectId,
  onImageUploaded,
  multiple = false,
  maxFiles = 10,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files.length) return

      setUploading(true)
      setUploadProgress(0)

      const filesToUpload = Array.from(files).slice(0, maxFiles)
      const totalFiles = filesToUpload.length

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]

        try {
          // Upload to Vercel Blob
          const uploadedImage = await uploadImage(file, projectId)

          // Save to database
          const savedImage = await saveImageToDatabase({
            filename: uploadedImage.filename,
            original_name: file.name,
            file_size: uploadedImage.size,
            mime_type: uploadedImage.type,
            blob_url: uploadedImage.url,
            project_id: projectId || null,
            uploaded_by: null, // TODO: Get current user ID
          })

          // Notify parent component
          if (onImageUploaded) {
            onImageUploaded({
              ...uploadedImage,
              id: savedImage.id,
            })
          }

          // Update progress
          setUploadProgress(((i + 1) / totalFiles) * 100)
        } catch (error) {
          console.error("Error uploading file:", file.name, error)
        }
      }

      setUploading(false)
      setUploadProgress(0)
    },
    [projectId, maxFiles, onImageUploaded],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
              <div>
                <p className="text-lg font-medium">上传中...</p>
                <Progress value={uploadProgress} className="w-full mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{Math.round(uploadProgress)}% 完成</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium mb-2">拖拽图片到此处或点击上传</p>
                <p className="text-sm text-muted-foreground mb-4">
                  支持 JPG, PNG, GIF 格式，最大 10MB
                  {multiple && ` (最多 ${maxFiles} 张)`}
                </p>
                <input
                  type="file"
                  multiple={multiple}
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      选择文件
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
