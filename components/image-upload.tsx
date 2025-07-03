"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface UploadedImage {
  url: string
  filename: string
  size: number
  type: string
}

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
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")

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
          // 创建FormData
          const formData = new FormData()
          formData.append('file', file)
          formData.append('projectId', projectId || '')
          if (category) {
            formData.append('category', category)
          }
          if (tags) {
            formData.append('tags', tags)
          }

          // 上传到API端点
          const response = await fetch('/api/images', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || '上传失败')
          }

          const result = await response.json()
          const uploadedImage = result.image

          // Notify parent component
          if (onImageUploaded) {
            onImageUploaded({
              url: uploadedImage.blob_url,
              filename: uploadedImage.filename,
              size: uploadedImage.file_size,
              type: uploadedImage.mime_type,
              id: uploadedImage.id,
            })
          }

          // Update progress
          setUploadProgress(((i + 1) / totalFiles) * 100)
        } catch (error) {
          console.error("Error uploading file:", file.name, error)
          // 显示错误提示
          alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }

      setUploading(false)
      setUploadProgress(0)
    },
    [projectId, maxFiles, onImageUploaded, category, tags],
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
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">图片分类</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logo">项目Logo</SelectItem>
                <SelectItem value="banner">横幅图片</SelectItem>
                <SelectItem value="social">社交媒体</SelectItem>
                <SelectItem value="tutorial">教程图片</SelectItem>
                <SelectItem value="marketing">营销素材</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">图片标签（用逗号分隔）</label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="如：logo, banner, 活动"
            />
          </div>
        </div>
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
