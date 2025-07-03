"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, CalendarIcon, ImageIcon, Video, Link, BarChart3, Edit, Trash2, Search, RefreshCw, X, Plus, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ImageUpload from "./image-upload"

interface EnhancedTelegramManagementProps {
  projectId: string
}

export default function EnhancedTelegramManagement({ projectId }: EnhancedTelegramManagementProps) {
  const [date, setDate] = useState<Date>()
  const [posts, setPosts] = useState<
    {
      id: string
      content: string
      status: string
      publishedAt: string | null
      scheduledFor: string | null
      type: string
      engagement: { 
        views: number
        reactions: number
        shares: number
        target_views?: number
        target_reactions?: number
      }
      images?: { id: string; url: string }[]
      tags?: string[]
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [postType, setPostType] = useState("text")
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [selectedImages, setSelectedImages] = useState<{id: string; url: string}[]>([])
  const [availableImages, setAvailableImages] = useState<{id: string; url: string}[]>([])
  const [postTargets, setPostTargets] = useState({
    views: 500,
    reactions: 100,
  })
  const [bulkPosts, setBulkPosts] = useState("")

  useEffect(() => {
    loadPosts()
    loadImages()
  }, [projectId, filterStatus])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ projectId })
      if (filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      const res = await fetch(`/api/telegram-posts?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || json.details)

      setPosts(
        json.posts.map((post) => ({
          id: post.id,
          content: post.content,
          status: post.status,
          publishedAt: post.published_at,
          scheduledFor: post.scheduled_for,
          type: post.post_type,
          engagement: {
            views: post.views_count || 0,
            reactions: post.reactions_count || 0,
            shares: post.shares_count || 0,
            target_views: post.target_views,
            target_reactions: post.target_reactions,
          },
          images: post.images?.map((img: any) => ({ id: img.id, url: img.blob_url })) || [],
          tags: post.tags || [],
        })),
      )
    } catch (error) {
      console.error("Error loading posts:", error)
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

  const handleSavePost = async () => {
    if (!newPost.trim()) return

    try {
      const res = await fetch("/api/telegram-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          content: newPost,
          post_type: postType,
          status: date ? "scheduled" : "draft",
          scheduled_for: date?.toISOString() || null,
          created_by: null,
          target_views: postTargets.views,
          target_reactions: postTargets.reactions,
          images: selectedImages.map(img => img.id),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || json.details)

      const savedPost = json.post
      setPosts((prev) => [
        {
          id: savedPost.id,
          content: savedPost.content,
          status: savedPost.status,
          publishedAt: savedPost.published_at,
          scheduledFor: savedPost.scheduled_for,
          type: savedPost.post_type,
          engagement: {
            views: savedPost.views_count || 0,
            reactions: savedPost.reactions_count || 0,
            shares: savedPost.shares_count || 0,
            target_views: savedPost.target_views,
            target_reactions: savedPost.target_reactions,
          },
          images: selectedImages,
        },
        ...prev,
      ])

      // 重置表单
      setNewPost("")
      setDate(undefined)
      setSelectedImages([])
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handlePostSelect = (postId: string) => {
    setSelectedPosts((prev) => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return

    switch (action) {
      case "delete":
        // 实现批量删除
        console.log("Bulk delete:", selectedPosts)
        break
      case "schedule":
        // 实现批量定时发布
        console.log("Bulk schedule:", selectedPosts)
        break
      case "publish":
        // 实现批量发布
        console.log("Bulk publish:", selectedPosts)
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

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return true
  })

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">电报管理</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            定时发布
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            立即发布
          </Button>
        </div>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">撰写帖子</TabsTrigger>
          <TabsTrigger value="library">帖子库</TabsTrigger>
          <TabsTrigger value="bulk">批量管理</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>撰写新帖子</CardTitle>
              <CardDescription>创建电报频道帖子内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-type">帖子类型</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">纯文本</SelectItem>
                      <SelectItem value="text_with_image">文本+图片</SelectItem>
                      <SelectItem value="text_with_link">文本+链接</SelectItem>
                      <SelectItem value="video">视频</SelectItem>
                      <SelectItem value="announcement">公告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>发布时间</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-content">帖子内容</Label>
                <Textarea
                  id="post-content"
                  placeholder="输入帖子内容..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={6}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{newPost.length} 字符</span>
                  <span>支持 Markdown 格式</span>
                </div>
              </div>

              {/* 已选图片预览 */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>已选图片</Label>
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
                                <Badge className="h-3 w-3 p-0 bg-white" />
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
                  <Label>互动目标</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="浏览量"
                        value={postTargets.views}
                        onChange={(e) => setPostTargets({...postTargets, views: parseInt(e.target.value) || 0})}
                        className="text-center"
                      />
                      <p className="text-xs text-center mt-1">浏览量</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="反应数"
                        value={postTargets.reactions}
                        onChange={(e) => setPostTargets({...postTargets, reactions: parseInt(e.target.value) || 0})}
                        className="text-center"
                      />
                      <p className="text-xs text-center mt-1">反应数</p>
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
                <Button variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  添加视频
                </Button>
                <Button variant="outline">
                  <Link className="w-4 h-4 mr-2" />
                  添加链接
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">保存草稿</Button>
                <Button variant="outline">预览</Button>
                <Button onClick={handleSavePost}>
                  {date ? "安排发布" : "发布帖子"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>帖子库</CardTitle>
              <CardDescription>管理所有电报帖子</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索和筛选 */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索帖子内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="scheduled">已安排</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 批量操作 */}
              {selectedPosts.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">已选择 {selectedPosts.length} 条帖子</span>
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

              {/* 帖子列表 */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">没有找到符合条件的帖子</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <Checkbox 
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => handlePostSelect(post.id)}
                          className="mr-3 mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(post.status)}>
                                {post.status === "published" ? "已发布" : 
                                 post.status === "scheduled" ? "已安排" : "草稿"}
                              </Badge>
                              <Badge variant="outline">{post.type}</Badge>
                              {post.status === "published" && post.publishedAt && (
                                <span className="text-xs text-muted-foreground">
                                  发布于: {new Date(post.publishedAt).toLocaleString()}
                                </span>
                              )}
                              {post.status === "scheduled" && post.scheduledFor && (
                                <span className="text-xs text-muted-foreground">
                                  计划于: {new Date(post.scheduledFor).toLocaleString()}
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
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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

                          <p className="text-sm">{post.content}</p>

                          {/* 图片预览 */}
                          {post.images && post.images.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {post.images.map((img, idx) => (
                                <img 
                                  key={idx} 
                                  src={img.url} 
                                  alt="Post image" 
                                  className="h-16 w-16 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          )}

                          {/* 互动数据 */}
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>浏览量</span>
                                <span>{post.engagement.views}/{post.engagement.target_views || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  post.engagement.views, 
                                  post.engagement.target_views
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>反应数</span>
                                <span>{post.engagement.reactions}/{post.engagement.target_reactions || '∞'}</span>
                              </div>
                              <Progress 
                                value={calculateEngagementProgress(
                                  post.engagement.reactions, 
                                  post.engagement.target_reactions
                                )} 
                                className="h-1"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>分享数</span>
                                <span>{post.engagement.shares}</span>
                              </div>
                              <Progress 
                                value={post.engagement.shares > 0 ? 50 : 0} 
                                className="h-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>批量帖子管理</CardTitle>
              <CardDescription>一次性上传和管理多条帖子</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-posts">批量帖子内容</Label>
                <Textarea
                  id="bulk-posts"
                  placeholder="每行一条帖子内容，最多30条..."
                  value={bulkPosts}
                  onChange={(e) => setBulkPosts(e.target.value)}
                  rows={10}
                />
                <p className="text-sm text-muted-foreground">
                  当前行数: {bulkPosts.split("\n").filter((line) => line.trim()).length}/30
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-post-type">帖子类型</Label>
                  <Select defaultValue="text">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">纯文本</SelectItem>
                      <SelectItem value="text_with_image">文本+图片</SelectItem>
                      <SelectItem value="text_with_link">文本+链接</SelectItem>
                      <SelectItem value="announcement">公告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>发布时间</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        选择日期
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">预览帖子</Button>
                <Button>批量导入</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>帖子数据分析</CardTitle>
              <CardDescription>查看帖子互动数据和表现</CardDescription>
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
    </div>
  )
} 