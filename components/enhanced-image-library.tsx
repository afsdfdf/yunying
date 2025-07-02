"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, ImageIcon, Search, Download, Edit, Trash2, Copy, Tag, Grid, List } from "lucide-react"
import ImageUpload from "./image-upload"

interface EnhancedImageLibraryProps {
  projectId: string
}

export default function EnhancedImageLibrary({ projectId }: EnhancedImageLibraryProps) {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const categories = [
    { value: "all", label: "全部图片" },
    { value: "logo", label: "项目Logo" },
    { value: "banner", label: "横幅图片" },
    { value: "social", label: "社交媒体" },
    { value: "tutorial", label: "教程图片" },
    { value: "marketing", label: "营销素材" },
    { value: "other", label: "其他" },
  ]

  useEffect(() => {
    loadImages()
  }, [projectId, selectedCategory])

  const loadImages = async () => {
    try {
      const params = new URLSearchParams({ projectId })
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      const res = await fetch(`/api/images?${params}`)
      const json = await res.json()
      if (res.ok) {
        setImages(json.images || [])
      }
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUploaded = (uploadedImage: any) => {
    setImages((prev) => [uploadedImage, ...prev])
  }

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const handleBulkAction = async (action: string) => {
    if (selectedImages.length === 0) return

    switch (action) {
      case "delete":
        // 实现批量删除
        console.log("Bulk delete:", selectedImages)
        break
      case "download":
        // 实现批量下载
        console.log("Bulk download:", selectedImages)
        break
      case "category":
        // 实现批量分类
        console.log("Bulk categorize:", selectedImages)
        break
    }
  }

  const filteredImages = images.filter((image) => {
    if (searchQuery) {
      return (
        image.original_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">图片库管理</h2>
        <div className="flex space-x-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                上传图片
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>上传图片</DialogTitle>
                <DialogDescription>支持单个或批量上传图片到项目图片库</DialogDescription>
              </DialogHeader>
              <ImageUpload projectId={projectId} multiple={true} maxFiles={20} onImageUploaded={handleImageUploaded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索图片名称或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作 */}
      {selectedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">已选择 {selectedImages.length} 张图片</span>
                <Button variant="outline" size="sm" onClick={() => setSelectedImages([])}>
                  取消选择
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("category")}>
                  <Tag className="w-4 h-4 mr-1" />
                  批量分类
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("download")}>
                  <Download className="w-4 h-4 mr-1" />
                  批量下载
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 图片展示 */}
      <Card>
        <CardHeader>
          <CardTitle>图片库</CardTitle>
          <CardDescription>
            共 {filteredImages.length} 张图片
            {selectedCategory !== "all" && ` · ${categories.find((c) => c.value === selectedCategory)?.label}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无图片</h3>
              <p className="text-muted-foreground mb-4">开始上传图片到您的项目图片库</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                上传第一张图片
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.blob_url || "/placeholder.svg"}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedImages.includes(image.id)}
                      onCheckedChange={() => handleImageSelect(image.id)}
                      className="bg-white"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium truncate">{image.original_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{Math.round(image.file_size / 1024)}KB</span>
                      {image.category && (
                        <Badge variant="outline" className="text-xs">
                          {categories.find((c) => c.value === image.category)?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <div key={image.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={selectedImages.includes(image.id)}
                    onCheckedChange={() => handleImageSelect(image.id)}
                  />
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.blob_url || "/placeholder.svg"}
                      alt={image.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{image.original_name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{Math.round(image.file_size / 1024)}KB</span>
                      <span>
                        {image.width}×{image.height}
                      </span>
                      <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {image.category && (
                    <Badge variant="outline">{categories.find((c) => c.value === image.category)?.label}</Badge>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
