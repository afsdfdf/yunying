"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  ImageIcon,
  Send,
  Calendar as CalendarIcon,
  BarChart3,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Upload,
  Copy,
  CheckCircle,
  AlertCircle,
  Target,
  RefreshCw,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import ImageUpload from "./image-upload"
import BatchUploadDialog from "./batch-upload-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface EnhancedTwitterManagementProps {
  projectId: string
}

export default function EnhancedTwitterManagement({ projectId }: EnhancedTwitterManagementProps) {
  const { toast } = useToast()
  const [tweets, setTweets] = useState<
    {
      id: string
      content: string
      status: string
      publishedAt: string | null
      scheduledFor: string | null
      created_at: string
      createdAt: string
      engagement: { 
        likes: number
        retweets: number
        replies: number
        views: number
        target_likes?: number
        target_retweets?: number
        target_replies?: number
      }
      images?: { id: string; url: string }[]
      tags?: string[]
      meta?: {
        english_content?: string
        chinese_translation?: string
        image_prompt?: string
      }
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [newTweet, setNewTweet] = useState("")
  const [bulkTweets, setBulkTweets] = useState("")
  const [selectedTweets, setSelectedTweets] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [selectedImages, setSelectedImages] = useState<{id: string; url: string}[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterTag, setFilterTag] = useState<string>("all")
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [availableImages, setAvailableImages] = useState<{id: string; url: string}[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortOrder, setSortOrder] = useState<{
    field: "created_at" | "scheduled_for" | "published_at" | "engagement",
    direction: "asc" | "desc"
  }>({ field: "created_at", direction: "desc" })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tweetTargets, setTweetTargets] = useState({
    likes: 100,
    retweets: 50,
    replies: 20,
  })
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null)
  const [editTweetId, setEditTweetId] = useState<string | null>(null)
  const [editTweetData, setEditTweetData] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)

  const loadTweets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ projectId })
      if (filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      const res = await fetch(`/api/twitter-posts?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || json.details)

      // 直接使用返回的推文数据，它已经包含了meta和tags字段
      setTweets(json.tweets)
      
      // 提取所有标签
      const allTags = json.tweets.flatMap((tweet: any) => tweet.tags || [])
      const uniqueTags = [...new Set(allTags)] as string[]
      setAvailableTags(uniqueTags)
    } catch (err) {
      console.error("Error loading tweets:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadImages = async () => {
    try {
      const res = await fetch(`/api/images?projectId=${projectId}`)
      const json = await res.json()
      if (res.ok) {
        setAvailableImages(json.images?.map((img: any) => ({ id: img.id, url: img.blob_url })) || [])
      }
    } catch (error) {
      console.error("Error loading images:", error)
    }
  }

  useEffect(() => {
    loadTweets()
    loadImages()
  }, [projectId, filterStatus])

  const handleSaveTweet = async () => {
    if (!newTweet.trim()) return
    
    try {
      // 获取当前时间并格式化为 [time] 标记
      const now = new Date()
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      // 在推文内容前添加 [time] 标记
      const contentWithTime = `[time]${timeString}\n${newTweet}`
      
      const post = {
        content: contentWithTime,
        project_id: projectId,
        status: "draft",
        meta: {
          english_content: contentWithTime,
          chinese_translation: "",
          image_prompt: ""
        },
        images: selectedImages.map(img => img.id),
        target_likes: tweetTargets.likes,
        target_retweets: tweetTargets.retweets,
        target_replies: tweetTargets.replies
      }
      
      const res = await fetch("/api/twitter-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save tweet")
      }
      
      // 清空表单并重新加载推文
      setNewTweet("")
      setSelectedImages([])
      setScheduledDate(undefined)
      await loadTweets()
      
      // 显示成功提示
      toast({
        title: "推文保存成功",
        description: "推文已保存到草稿箱",
      })
      
    } catch (err) {
      console.error("Error saving tweet:", err)
      // 显示错误提示
      toast({
        title: "保存失败",
        description: err instanceof Error ? err.message : "推文保存失败",
        variant: "destructive",
      })
    }
  }

  const handleTweetSelect = (tweetId: string) => {
    setSelectedTweets((prev) => 
      prev.includes(tweetId) ? prev.filter(id => id !== tweetId) : [...prev, tweetId]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedTweets.length === 0) return

    switch (action) {
      case "delete":
        // 实现批量删除
        console.log("Bulk delete:", selectedTweets)
        break
      case "schedule":
        // 实现批量定时发布
        console.log("Bulk schedule:", selectedTweets)
        break
      case "publish":
        // 实现批量发布
        console.log("Bulk publish:", selectedTweets)
        break
    }
  }

  const handleImageSelect = (image: {id: string; url: string}) => {
    setSelectedImages(prev => {
      const exists = prev.some(img => img.id === image.id)
      if (exists) {
        return prev.filter(img => img.id !== image.id)
      } else {
        return [...prev, image]
      }
    })
  }

  const handleRemoveImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleImageUploaded = (uploadedImage: any) => {
    // 添加到已选图片列表
    setSelectedImages(prev => [...prev, {
      id: uploadedImage.id,
      url: uploadedImage.url
    }])
    // 添加到可用图片列表
    setAvailableImages(prev => [...prev, {
      id: uploadedImage.id,
      url: uploadedImage.url
    }])
    // 关闭上传对话框
    setShowImageUpload(false)
    // 显示成功提示
    toast({
      title: "图片上传成功",
      description: `"${uploadedImage.original_name}" 已添加到推文图片列表`,
    })
  }

  const handleTweetImageUpload = (tweetId: string) => {
    setEditingTweetId(tweetId)
    setShowImageUpload(true)
  }

  const handleTweetImageUploaded = async (uploadedImage: any) => {
    if (!editingTweetId) return

    try {
      // 更新推文的图片列表
      const res = await fetch(`/api/twitter-posts/${editingTweetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: [uploadedImage.id]
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update tweet images')
      }

      // 重新加载推文列表
      await loadTweets()
      
      // 关闭上传对话框
      setShowImageUpload(false)
      setEditingTweetId(null)
      
      // 显示成功提示
      toast({
        title: "图片上传成功",
        description: `"${uploadedImage.original_name}" 已添加到推文`,
      })
    } catch (error) {
      console.error('Error updating tweet images:', error)
      toast({
        title: "更新失败",
        description: "无法将图片添加到推文",
        variant: "destructive",
      })
    }
  }

  // 发布推文
  const handlePublishTweet = async (tweetId: string) => {
    try {
      const res = await fetch(`/api/twitter-posts/${tweetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          published_at: new Date().toISOString()
        })
      })

      if (!res.ok) {
        throw new Error('Failed to publish tweet')
      }

      // 重新加载推文列表
      await loadTweets()
      
      // 显示成功提示
      toast({
        title: "推文发布成功",
        description: "推文已发布并移动到已发布列表",
      })
    } catch (error) {
      console.error('Error publishing tweet:', error)
      toast({
        title: "发布失败",
        description: "无法发布推文",
        variant: "destructive",
      })
    }
  }

  // 批量发布推文
  const handleBulkPublish = async () => {
    if (selectedTweets.length === 0) {
      toast({
        title: "请选择推文",
        description: "请先选择要发布的推文",
        variant: "destructive",
      })
      return
    }

    try {
      const publishPromises = selectedTweets.map(tweetId => 
        fetch(`/api/twitter-posts/${tweetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'published',
            published_at: new Date().toISOString()
          })
        })
      )

      await Promise.all(publishPromises)
      
      // 重新加载推文列表
      await loadTweets()
      
      // 清空选择
      setSelectedTweets([])
      
      // 显示成功提示
      toast({
        title: "批量发布成功",
        description: `已发布 ${selectedTweets.length} 条推文`,
      })
    } catch (error) {
      console.error('Error bulk publishing tweets:', error)
      toast({
        title: "批量发布失败",
        description: "部分推文发布失败",
        variant: "destructive",
      })
    }
  }

  // 排序推文
  const sortTweets = (tweetsToSort: typeof tweets) => {
    return [...tweetsToSort].sort((a, b) => {
      if (sortOrder.field === "created_at") {
        // 使用createdAt字段而不是publishedAt
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return sortOrder.direction === "asc" ? dateA - dateB : dateB - dateA
      } 
      else if (sortOrder.field === "published_at") {
        // 按发布时间排序，未发布的排在最后
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : Number.MAX_SAFE_INTEGER
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : Number.MAX_SAFE_INTEGER
        return sortOrder.direction === "asc" ? dateA - dateB : dateB - dateA
      } 
      else if (sortOrder.field === "scheduled_for") {
        // 确保正确处理null值，未安排的排在最后
        const dateA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER
        const dateB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER
        return sortOrder.direction === "asc" ? dateA - dateB : dateB - dateA
      }
      else if (sortOrder.field === "engagement") {
        // 添加空值检查，避免undefined错误
        const engagementA = (a.engagement?.likes || 0) + (a.engagement?.retweets || 0) + (a.engagement?.replies || 0)
        const engagementB = (b.engagement?.likes || 0) + (b.engagement?.retweets || 0) + (b.engagement?.replies || 0)
        return sortOrder.direction === "asc" ? engagementA - engagementB : engagementB - engagementA
      }
      return 0
    })
  }

  // 过滤推文
  const filteredTweets = tweets
    .filter(tweet => {
      // 搜索过滤
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const contentMatch = tweet.content.toLowerCase().includes(searchLower)
        const englishMatch = tweet.meta?.english_content?.toLowerCase().includes(searchLower) || false
        const chineseMatch = tweet.meta?.chinese_translation?.toLowerCase().includes(searchLower) || false
        const tagsMatch = tweet.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false
        
        if (!(contentMatch || englishMatch || chineseMatch || tagsMatch)) {
          return false
        }
      }
      
      // 状态过滤
      if (filterStatus !== "all" && tweet.status !== filterStatus) {
        return false
      }
      
      // 标签过滤
      if (filterTag !== "all" && !tweet.tags?.includes(filterTag)) {
        return false
      }
      
      return true
    })

  const sortedAndFilteredTweets = sortTweets(filteredTweets)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published": return "default"
      case "scheduled": return "secondary"
      case "draft": return "outline"
      default: return "outline"
    }
  }

  const calculateEngagementProgress = (current: number, target?: number) => {
    if (!target || target === 0) return 0
    const progress = Math.min(Math.round((current / target) * 100), 100)
    return progress
  }

  // 解析推文内容中的 [time] 标记
  const parseTweetContent = (content: string) => {
    const timeMatch = content.match(/\[time\](.*?)(?:\n|$)/)
    if (timeMatch) {
      const timeString = timeMatch[1].trim()
      const contentWithoutTime = content.replace(/\[time\].*?(?:\n|$)/, '').trim()
      return {
        timeString,
        contentWithoutTime,
        hasTime: true
      }
    }
    return {
      timeString: '',
      contentWithoutTime: content,
      hasTime: false
    }
  }

  const publishedTweets = tweets.filter(tweet => tweet.status === "published")

  const openEditDialog = (tweet: any) => {
    setEditTweetId(tweet.id)
    setEditTweetData({
      content: tweet.content,
      tags: tweet.tags?.join(", ") || "",
      english_content: tweet.meta?.english_content || "",
      chinese_translation: tweet.meta?.chinese_translation || "",
      image_prompt: tweet.meta?.image_prompt || "",
      images: tweet.images ? [...tweet.images] : [],
    })
  }
  const closeEditDialog = () => {
    setEditTweetId(null)
    setEditTweetData(null)
  }
  const handleEditChange = (field: string, value: any) => {
    setEditTweetData((prev: any) => ({ ...prev, [field]: value }))
  }
  const handleEditImageSelect = (image: {id: string; url: string}) => {
    setEditTweetData((prev: any) => {
      const exists = prev.images.some((img: any) => img.id === image.id)
      if (exists) {
        return { ...prev, images: prev.images.filter((img: any) => img.id !== image.id) }
      } else {
        return { ...prev, images: [...prev.images, image] }
      }
    })
  }
  const handleEditRemoveImage = (imageId: string) => {
    setEditTweetData((prev: any) => ({ ...prev, images: prev.images.filter((img: any) => img.id !== imageId) }))
  }
  const handleEditSave = async () => {
    if (!editTweetId) return
    setEditLoading(true)
    try {
      const patchData: any = {
        content: editTweetData.content,
        tags: editTweetData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        meta: {
          english_content: editTweetData.english_content,
          chinese_translation: editTweetData.chinese_translation,
          image_prompt: editTweetData.image_prompt,
        },
        images: editTweetData.images.map((img: any) => img.id),
      }
      const res = await fetch(`/api/twitter-posts/${editTweetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      })
      if (!res.ok) throw new Error("保存失败")
      closeEditDialog()
      await loadTweets()
      toast({ title: "保存成功", description: "推文内容已更新" })
    } catch (e) {
      toast({ title: "保存失败", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">推特管理</h2>
        <div className="flex space-x-2">
          <BatchUploadDialog
            projectId={projectId}
            type="twitter"
            onUploadComplete={(results) => {
              loadTweets()
            }}
          />
          <Button>
            <Send className="w-4 h-4 mr-2" />
            发布推文
          </Button>
        </div>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">撰写推文</TabsTrigger>
          <TabsTrigger value="library">推文库</TabsTrigger>
          <TabsTrigger value="published">已发布</TabsTrigger>
          <TabsTrigger value="images">图片管理</TabsTrigger>
          <TabsTrigger value="bulk">批量管理</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>撰写新推文</CardTitle>
              <CardDescription>创建和编辑推文内容，保存时会自动添加 [time] 时间标记</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tweet-content">推文内容</Label>
                <Textarea
                  id="tweet-content"
                  placeholder="输入推文内容...（保存时会自动添加时间标记）"
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{newTweet.length}/280 字符</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowImageUpload(true)}
                      disabled={selectedImages.length >= 4}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      上传图片
                    </Button>
                  <span>剩余: {280 - newTweet.length}</span>
                  </div>
                </div>
              </div>

              {/* 已选图片预览 */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>已选图片 ({selectedImages.length}/4)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedImages.map(image => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.url} 
                          alt="Selected" 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button 
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最多支持4张图片，当前已选择 {selectedImages.length} 张
                  </p>
                </div>
              )}

              {/* 图片选择器 */}
              {showImageSelector && (
                <Card className="border border-dashed p-2">
                  <CardHeader className="p-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">选择图片</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowImageSelector(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ScrollArea className="h-40">
                      <div className="grid grid-cols-4 gap-2">
                        {availableImages.map(image => (
                          <div 
                            key={image.id} 
                            className={`relative cursor-pointer border-2 rounded-md ${
                              selectedImages.some(img => img.id === image.id) 
                                ? 'border-blue-500' 
                                : 'border-transparent'
                            }`}
                            onClick={() => handleImageSelect(image)}
                          >
                            <img 
                              src={image.url} 
                              alt="Available" 
                              className="h-16 w-16 object-cover rounded-md"
                            />
                            {selectedImages.some(img => img.id === image.id) && (
                              <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>发布时间</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>互动目标</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="点赞"
                        value={tweetTargets.likes}
                        onChange={(e) => setTweetTargets({...tweetTargets, likes: parseInt(e.target.value) || 0})}
                        className="text-center"
                      />
                      <p className="text-xs text-center mt-1">点赞</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="转发"
                        value={tweetTargets.retweets}
                        onChange={(e) => setTweetTargets({...tweetTargets, retweets: parseInt(e.target.value) || 0})}
                        className="text-center"
                      />
                      <p className="text-xs text-center mt-1">转发</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="评论"
                        value={tweetTargets.replies}
                        onChange={(e) => setTweetTargets({...tweetTargets, replies: parseInt(e.target.value) || 0})}
                        className="text-center"
                      />
                      <p className="text-xs text-center mt-1">评论</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageSelector(!showImageSelector)}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {showImageSelector ? "关闭图片选择" : "添加图片"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageUpload(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上传图片
                </Button>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  定时发布
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">保存草稿</Button>
                <Button onClick={handleSaveTweet}>
                  {scheduledDate ? "安排发布" : "立即发布"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>推文库</CardTitle>
                  <CardDescription>管理所有推文</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                  >
                    {viewMode === "list" ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <rect width="8" height="8" x="3" y="3" rx="1" />
                          <rect width="8" height="8" x="13" y="3" rx="1" />
                          <rect width="8" height="8" x="3" y="13" rx="1" />
                          <rect width="8" height="8" x="13" y="13" rx="1" />
                        </svg>
                        网格视图
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <line x1="8" x2="21" y1="6" y2="6" />
                          <line x1="8" x2="21" y1="12" y2="12" />
                          <line x1="8" x2="21" y1="18" y2="18" />
                          <line x1="3" x2="3.01" y1="6" y2="6" />
                          <line x1="3" x2="3.01" y1="12" y2="12" />
                          <line x1="3" x2="3.01" y1="18" y2="18" />
                        </svg>
                        列表视图
                      </>
                    )}
                  </Button>
                  <Select 
                    value={`${sortOrder.field}-${sortOrder.direction}`} 
                    onValueChange={(value) => {
                      const [field, direction] = value.split('-') as ["created_at" | "scheduled_for" | "published_at" | "engagement", "asc" | "desc"]
                      setSortOrder({ field, direction })
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at-desc">最新创建</SelectItem>
                      <SelectItem value="created_at-asc">最早创建</SelectItem>
                      <SelectItem value="published_at-desc">最新发布</SelectItem>
                      <SelectItem value="published_at-asc">最早发布</SelectItem>
                      <SelectItem value="scheduled_for-asc">最早计划</SelectItem>
                      <SelectItem value="scheduled_for-desc">最晚计划</SelectItem>
                      <SelectItem value="engagement-desc">互动量最高</SelectItem>
                      <SelectItem value="engagement-asc">互动量最低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索和筛选 */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索推文内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="scheduled">已安排</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="标签" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部标签</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 标签快速筛选 */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <Button 
                    variant={filterTag === "all" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setFilterTag("all")}
                    className="h-7 text-xs"
                  >
                    全部
                  </Button>
                  {availableTags.slice(0, 10).map(tag => (
                    <Button 
                      key={tag} 
                      variant={filterTag === tag ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilterTag(tag)}
                      className="h-7 text-xs"
                    >
                      {tag}
                    </Button>
                  ))}
                  {availableTags.length > 10 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      +{availableTags.length - 10}个标签
                    </Button>
                  )}
                </div>
              )}

              {/* 批量操作 */}
              {selectedTweets.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">已选择 {selectedTweets.length} 条推文</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("schedule")}>
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      批量安排
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("publish")}>
                      <Send className="w-4 h-4 mr-1" />
                      批量发布
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      批量删除
                    </Button>
                  </div>
                </div>
              )}

              {/* 推文列表 */}
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
              ) : sortedAndFilteredTweets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">没有找到符合条件的推文</p>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-4">
                  {sortedAndFilteredTweets.map((tweet) => (
                    <div key={tweet.id} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <Checkbox 
                          checked={selectedTweets.includes(tweet.id)}
                          onCheckedChange={() => handleTweetSelect(tweet.id)}
                          className="mr-3 mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(tweet.status)}>
                                {tweet.status === "published" ? "已发布" : 
                                 tweet.status === "scheduled" ? "已安排" : "草稿"}
                              </Badge>
                              {tweet.status === "published" && tweet.publishedAt && (
                                <span className="text-xs text-muted-foreground">
                                  发布于: {new Date(tweet.publishedAt).toLocaleString()}
                                </span>
                              )}
                              {tweet.status === "scheduled" && tweet.scheduledFor && (
                                <span className="text-xs text-muted-foreground">
                                  计划于: {new Date(tweet.scheduledFor).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(tweet)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishTweet(tweet.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  发布
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* 推文内容区域 - 左右排列：英文、中文、标签、图片提示词、图片、日期时间 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-2">
                            {/* 英文内容 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">EN</Badge>
                                <span className="text-xs font-medium text-muted-foreground">英文</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                {(() => {
                                  const parsed = parseTweetContent(tweet.meta?.english_content || tweet.content)
                                  return (
                                    <div className="space-y-1">
                                      {parsed.hasTime && (
                                        <div className="text-xs">
                                          <Badge variant="secondary" className="mr-1 text-[10px]">TIME</Badge>
                                          <span className="text-blue-600 font-medium">{parsed.timeString}</span>
                                        </div>
                                      )}
                                      <p className="text-sm">{parsed.contentWithoutTime}</p>
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                            
                            {/* 中文内容 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">CN</Badge>
                                <span className="text-xs font-medium text-muted-foreground">中文</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <p className="text-sm">{tweet.meta?.chinese_translation || "无中文翻译"}</p>
                              </div>
                            </div>
                            
                            {/* 标签 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">TAGS</Badge>
                                <span className="text-xs font-medium text-muted-foreground">标签</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                {tweet.tags && tweet.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {tweet.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">无标签</p>
                                )}
                              </div>
                            </div>
                            
                            {/* 图片提示词 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">IMG</Badge>
                                <span className="text-xs font-medium text-muted-foreground">图片提示词</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <p className="text-sm italic">{tweet.meta?.image_prompt || "无图片提示词"}</p>
                              </div>
                            </div>
                            
                            {/* 图片预览 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">PREVIEW</Badge>
                                <span className="text-xs font-medium text-muted-foreground">图片</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] flex items-center justify-center">
                                {tweet.images && tweet.images.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {tweet.images.map((img, idx) => (
                                      <img 
                                        key={idx} 
                                        src={img.url} 
                                        alt="Tweet image" 
                                        className="h-16 w-16 object-cover rounded-md"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => handleTweetImageUpload(tweet.id)}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    上传图片
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* 日期时间 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">TIME</Badge>
                                <span className="text-xs font-medium text-muted-foreground">日期时间</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <div className="space-y-1">
                                  <div className="text-xs">
                                    <span className="font-medium">创建:</span>
                                    <br />
                                    <span className="text-muted-foreground">
                                      {tweet.createdAt ? new Date(tweet.createdAt).toLocaleString('zh-CN') : '未知'}
                                    </span>
                                  </div>
                                  {tweet.status === "published" && tweet.publishedAt && (
                                    <div className="text-xs">
                                      <span className="font-medium">发布:</span>
                                      <br />
                                      <span className="text-muted-foreground">
                                        {new Date(tweet.publishedAt).toLocaleString('zh-CN')}
                                      </span>
                                    </div>
                                  )}
                                  {tweet.status === "scheduled" && tweet.scheduledFor && (
                                    <div className="text-xs">
                                      <span className="font-medium">计划:</span>
                                      <br />
                                      <span className="text-muted-foreground">
                                        {new Date(tweet.scheduledFor).toLocaleString('zh-CN')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 互动数据 */}
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>点赞</span>
                                <span>{tweet.engagement?.likes || 0}/{tweet.engagement?.target_likes || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.likes || 0, 
                                  tweet.engagement?.target_likes
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>转发</span>
                                <span>{tweet.engagement?.retweets || 0}/{tweet.engagement?.target_retweets || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.retweets || 0, 
                                  tweet.engagement?.target_retweets
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>评论</span>
                                <span>{tweet.engagement?.replies || 0}/{tweet.engagement?.target_replies || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.replies || 0, 
                                  tweet.engagement?.target_replies
                                )} 
                                className="h-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedAndFilteredTweets.map((tweet) => (
                    <div key={tweet.id} className="border rounded-lg overflow-hidden flex flex-col h-full">
                      {/* 图片部分 */}
                      <div className="relative h-40 bg-gray-100">
                        {tweet.images && tweet.images.length > 0 ? (
                          <img 
                            src={tweet.images[0].url} 
                            alt="Tweet image" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Checkbox 
                            checked={selectedTweets.includes(tweet.id)}
                            onCheckedChange={() => handleTweetSelect(tweet.id)}
                            className="bg-white/80"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge variant={getStatusBadgeVariant(tweet.status)}>
                            {tweet.status === "published" ? "已发布" : 
                             tweet.status === "scheduled" ? "已安排" : "草稿"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* 内容部分 */}
                      <div className="p-3 flex-1 flex flex-col">
                        {/* 分类显示内容 */}
                        <div className="space-y-2 flex-1">
                          {/* 英文内容 */}
                          <div>
                            <div className="flex items-center mb-1">
                              <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">EN</Badge>
                            </div>
                            {(() => {
                              const parsed = parseTweetContent(tweet.meta?.english_content || tweet.content)
                              return (
                                <div className="space-y-1">
                                  {parsed.hasTime && (
                                    <div className="text-xs">
                                      <Badge variant="secondary" className="mr-1 text-[8px]">TIME</Badge>
                                      <span className="text-blue-600 font-medium">{parsed.timeString}</span>
                                    </div>
                                  )}
                                  <p className="text-sm line-clamp-2">{parsed.contentWithoutTime}</p>
                                </div>
                              )
                            })()}
                          </div>
                          
                          {/* 中文内容 - 如果有 */}
                          {tweet.meta?.chinese_translation && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">CN</Badge>
                              </div>
                              <p className="text-sm line-clamp-1 text-muted-foreground">
                                {tweet.meta.chinese_translation}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* 标签 */}
                        {tweet.tags && tweet.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">TAGS</Badge>
                            {tweet.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {tweet.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tweet.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* 日期时间 */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center mb-1">
                            <Badge variant="outline" className="mr-1 px-1 py-0 h-3 text-[8px]">TIME</Badge>
                            <span>创建: {tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString('zh-CN') : '未知'}</span>
                          </div>
                          {tweet.status === "published" && tweet.publishedAt && (
                            <div className="text-xs text-green-600">
                              发布: {new Date(tweet.publishedAt).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                          {tweet.status === "scheduled" && tweet.scheduledFor && (
                            <div className="text-xs text-blue-600">
                              计划: {new Date(tweet.scheduledFor).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                        </div>
                        
                        {/* 互动数据 */}
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span>{tweet.engagement?.likes || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="m3 12 3-3v2h12v2H6v2Z" />
                              <path d="M18 6h3v12h-3" />
                            </svg>
                            <span>{tweet.engagement?.retweets || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{tweet.engagement?.replies || 0}</span>
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(tweet)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishTweet(tweet.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  发布
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>已发布推文</CardTitle>
              <CardDescription>所有已发布的推文，支持查看、复制、图片管理等</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
              ) : publishedTweets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">暂无已发布推文</p>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-4">
                  {publishedTweets.map((tweet) => (
                    <div key={tweet.id} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <Checkbox 
                          checked={selectedTweets.includes(tweet.id)}
                          onCheckedChange={() => handleTweetSelect(tweet.id)}
                          className="mr-3 mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(tweet.status)}>
                                {tweet.status === "published" ? "已发布" : 
                                 tweet.status === "scheduled" ? "已安排" : "草稿"}
                              </Badge>
                              {tweet.status === "published" && tweet.publishedAt && (
                                <span className="text-xs text-muted-foreground">
                                  发布于: {new Date(tweet.publishedAt).toLocaleString()}
                                </span>
                              )}
                              {tweet.status === "scheduled" && tweet.scheduledFor && (
                                <span className="text-xs text-muted-foreground">
                                  计划于: {new Date(tweet.scheduledFor).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(tweet)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishTweet(tweet.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  发布
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* 推文内容区域 - 左右排列：英文、中文、标签、图片提示词、图片、日期时间 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-2">
                            {/* 英文内容 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">EN</Badge>
                                <span className="text-xs font-medium text-muted-foreground">英文</span>
                        </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                {(() => {
                                  const parsed = parseTweetContent(tweet.meta?.english_content || tweet.content)
                                  return (
                                    <div className="space-y-1">
                                      {parsed.hasTime && (
                                        <div className="text-xs">
                                          <Badge variant="secondary" className="mr-1 text-[10px]">TIME</Badge>
                                          <span className="text-blue-600 font-medium">{parsed.timeString}</span>
                      </div>
                                      )}
                                      <p className="text-sm">{parsed.contentWithoutTime}</p>
                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                            
                            {/* 中文内容 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">CN</Badge>
                                <span className="text-xs font-medium text-muted-foreground">中文</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <p className="text-sm">{tweet.meta?.chinese_translation || "无中文翻译"}</p>
                              </div>
                            </div>
                            
                            {/* 标签 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">TAGS</Badge>
                                <span className="text-xs font-medium text-muted-foreground">标签</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                {tweet.tags && tweet.tags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {tweet.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">无标签</p>
                                )}
                              </div>
                            </div>
                            
                            {/* 图片提示词 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">IMG</Badge>
                                <span className="text-xs font-medium text-muted-foreground">图片提示词</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <p className="text-sm italic">{tweet.meta?.image_prompt || "无图片提示词"}</p>
                              </div>
                            </div>
                            
                            {/* 图片预览 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">PREVIEW</Badge>
                                <span className="text-xs font-medium text-muted-foreground">图片</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] flex items-center justify-center">
                                {tweet.images && tweet.images.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {tweet.images.map((img, idx) => (
                                      <img 
                                        key={idx} 
                                        src={img.url} 
                                        alt="Tweet image" 
                                        className="h-16 w-16 object-cover rounded-md"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => handleTweetImageUpload(tweet.id)}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    上传图片
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* 日期时间 */}
                            <div className="col-span-1">
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1">TIME</Badge>
                                <span className="text-xs font-medium text-muted-foreground">日期时间</span>
                              </div>
                              <div className="bg-muted/20 p-2 rounded-md h-[100px] overflow-y-auto">
                                <div className="space-y-1">
                                  <div className="text-xs">
                                    <span className="font-medium">创建:</span>
                                    <br />
                                    <span className="text-muted-foreground">
                                      {tweet.createdAt ? new Date(tweet.createdAt).toLocaleString('zh-CN') : '未知'}
                                    </span>
                                  </div>
                                  {tweet.status === "published" && tweet.publishedAt && (
                                    <div className="text-xs">
                                      <span className="font-medium">发布:</span>
                                      <br />
                                      <span className="text-muted-foreground">
                                        {new Date(tweet.publishedAt).toLocaleString('zh-CN')}
                                      </span>
                                    </div>
                                  )}
                                  {tweet.status === "scheduled" && tweet.scheduledFor && (
                                    <div className="text-xs">
                                      <span className="font-medium">计划:</span>
                                      <br />
                                      <span className="text-muted-foreground">
                                        {new Date(tweet.scheduledFor).toLocaleString('zh-CN')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 互动数据 */}
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>点赞</span>
                                <span>{tweet.engagement?.likes || 0}/{tweet.engagement?.target_likes || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.likes || 0, 
                                  tweet.engagement?.target_likes
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>转发</span>
                                <span>{tweet.engagement?.retweets || 0}/{tweet.engagement?.target_retweets || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.retweets || 0, 
                                  tweet.engagement?.target_retweets
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>评论</span>
                                <span>{tweet.engagement?.replies || 0}/{tweet.engagement?.target_replies || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  tweet.engagement?.replies || 0, 
                                  tweet.engagement?.target_replies
                                )} 
                                className="h-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publishedTweets.map((tweet) => (
                    <div key={tweet.id} className="border rounded-lg overflow-hidden flex flex-col h-full">
                      {/* 图片部分 */}
                      <div className="relative h-40 bg-gray-100">
                        {tweet.images && tweet.images.length > 0 ? (
                          <img 
                            src={tweet.images[0].url} 
                            alt="Tweet image" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Checkbox 
                            checked={selectedTweets.includes(tweet.id)}
                            onCheckedChange={() => handleTweetSelect(tweet.id)}
                            className="bg-white/80"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge variant={getStatusBadgeVariant(tweet.status)}>
                            {tweet.status === "published" ? "已发布" : 
                             tweet.status === "scheduled" ? "已安排" : "草稿"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* 内容部分 */}
                      <div className="p-3 flex-1 flex flex-col">
                        {/* 分类显示内容 */}
                        <div className="space-y-2 flex-1">
                          {/* 英文内容 */}
                          <div>
                            <div className="flex items-center mb-1">
                              <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">EN</Badge>
                            </div>
                            {(() => {
                              const parsed = parseTweetContent(tweet.meta?.english_content || tweet.content)
                              return (
                                <div className="space-y-1">
                                  {parsed.hasTime && (
                                    <div className="text-xs">
                                      <Badge variant="secondary" className="mr-1 text-[8px]">TIME</Badge>
                                      <span className="text-blue-600 font-medium">{parsed.timeString}</span>
                                    </div>
                                  )}
                                  <p className="text-sm line-clamp-2">{parsed.contentWithoutTime}</p>
                                </div>
                              )
                            })()}
                          </div>
                          
                          {/* 中文内容 - 如果有 */}
                          {tweet.meta?.chinese_translation && (
                            <div>
                              <div className="flex items-center mb-1">
                                <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">CN</Badge>
                              </div>
                              <p className="text-sm line-clamp-1 text-muted-foreground">
                                {tweet.meta.chinese_translation}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* 标签 */}
                        {tweet.tags && tweet.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="mr-1 px-1 py-0 h-4 text-[10px]">TAGS</Badge>
                            {tweet.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {tweet.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tweet.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* 日期时间 */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center mb-1">
                            <Badge variant="outline" className="mr-1 px-1 py-0 h-3 text-[8px]">TIME</Badge>
                            <span>创建: {tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString('zh-CN') : '未知'}</span>
                          </div>
                          {tweet.status === "published" && tweet.publishedAt && (
                            <div className="text-xs text-green-600">
                              发布: {new Date(tweet.publishedAt).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                          {tweet.status === "scheduled" && tweet.scheduledFor && (
                            <div className="text-xs text-blue-600">
                              计划: {new Date(tweet.scheduledFor).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                        </div>
                        
                        {/* 互动数据 */}
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span>{tweet.engagement?.likes || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="m3 12 3-3v2h12v2H6v2Z" />
                              <path d="M18 6h3v12h-3" />
                            </svg>
                            <span>{tweet.engagement?.retweets || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{tweet.engagement?.replies || 0}</span>
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(tweet)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePublishTweet(tweet.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  发布
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>图片管理</CardTitle>
              <CardDescription>管理项目中的图片资源，上传、分类和选择图片</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 图片上传区域 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">上传图片</h3>
                  <Button onClick={() => setShowImageUpload(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    上传新图片
                  </Button>
                </div>
                
                {/* 批量上传 */}
                <BatchUploadDialog projectId={projectId} type="twitter" />
              </div>

              {/* 图片库展示 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">图片库</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                    >
                      {viewMode === "list" ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <rect width="8" height="8" x="3" y="3" rx="1" />
                            <rect width="8" height="8" x="13" y="3" rx="1" />
                            <rect width="8" height="8" x="3" y="13" rx="1" />
                            <rect width="8" height="8" x="13" y="13" rx="1" />
                          </svg>
                          网格视图
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <line x1="8" x2="21" y1="6" y2="6" />
                            <line x1="8" x2="21" y1="12" y2="12" />
                            <line x1="8" x2="21" y1="18" y2="18" />
                            <line x1="3" x2="3.01" y1="6" y2="6" />
                            <line x1="3" x2="3.01" y1="12" y2="12" />
                            <line x1="3" x2="3.01" y1="18" y2="18" />
                          </svg>
                          列表视图
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadImages}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </Button>
                  </div>
                </div>

                {/* 图片网格展示 */}
                {availableImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {availableImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image.url}
                            alt="Project image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleImageSelect(image)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无图片</h3>
                    <p className="text-muted-foreground mb-4">上传一些图片开始使用</p>
                    <Button onClick={() => setShowImageUpload(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      上传第一张图片
                    </Button>
                  </div>
                )}
              </div>

              {/* 已选图片预览 */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>已选图片 ({selectedImages.length}/4)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedImages.map(image => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.url} 
                          alt="Selected" 
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button 
                          className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最多支持4张图片，当前已选择 {selectedImages.length} 张
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>批量推文管理</CardTitle>
              <CardDescription>一次性上传和管理多条推文</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-tweets">批量推文内容</Label>
                <Textarea
                  id="bulk-tweets"
                  placeholder="每行一条推文，最多50条..."
                  value={bulkTweets}
                  onChange={(e) => setBulkTweets(e.target.value)}
                  rows={10}
                />
                <p className="text-sm text-muted-foreground">
                  当前行数: {bulkTweets.split("\n").filter((line) => line.trim()).length}/50
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">预览推文</Button>
                <Button>批量导入</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>推文数据分析</CardTitle>
              <CardDescription>查看推文互动数据和表现</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">数据分析功能开发中</h3>
                <p className="text-muted-foreground">此功能将在后续版本中提供</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 图片上传对话框 */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTweetId ? "为推文上传图片" : "上传图片"}
            </DialogTitle>
            <DialogDescription>
              {editingTweetId 
                ? "上传图片到项目图片库，上传后将自动添加到当前推文"
                : "上传图片到项目图片库，上传后可以添加到推文中"
              }
            </DialogDescription>
          </DialogHeader>
          <ImageUpload 
            projectId={projectId}
            multiple={true}
            maxFiles={10}
            onImageUploaded={editingTweetId ? handleTweetImageUploaded : handleImageUploaded}
          />
        </DialogContent>
      </Dialog>
      
      <Toaster />

      <Dialog open={!!editTweetId} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑推文</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>推文正文</Label>
            <Textarea value={editTweetData?.content || ""} onChange={e => handleEditChange("content", e.target.value)} rows={4} />
            <Label>标签（逗号分隔）</Label>
            <Input value={editTweetData?.tags || ""} onChange={e => handleEditChange("tags", e.target.value)} />
            <Label>英文内容</Label>
            <Textarea value={editTweetData?.english_content || ""} onChange={e => handleEditChange("english_content", e.target.value)} rows={2} />
            <Label>中文翻译</Label>
            <Textarea value={editTweetData?.chinese_translation || ""} onChange={e => handleEditChange("chinese_translation", e.target.value)} rows={2} />
            <Label>图片提示词</Label>
            <Input value={editTweetData?.image_prompt || ""} onChange={e => handleEditChange("image_prompt", e.target.value)} />
            <Label>图片选择</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editTweetData?.images?.map((img: any) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt="Selected" className="h-16 w-16 object-cover rounded-md" />
                  <button className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-80" onClick={() => handleEditRemoveImage(img.id)}>
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableImages.map(image => (
                <Button key={image.id} variant={editTweetData?.images?.some((img: any) => img.id === image.id) ? "secondary" : "outline"} size="sm" onClick={() => handleEditImageSelect(image)}>
                  <img src={image.url} alt="img" className="h-8 w-8 object-cover rounded mr-1" />
                  {editTweetData?.images?.some((img: any) => img.id === image.id) ? "已选" : "选择"}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>取消</Button>
            <Button onClick={handleEditSave} loading={editLoading}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 