"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Send, CalendarIcon, ImageIcon, Video, Link, BarChart3, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
// 删除这行
// import { getTelegramPosts, createTelegramPost } from "@/lib/database"

interface TelegramManagementProps {
  projectId: string
}

export default function TelegramManagement({ projectId }: TelegramManagementProps) {
  const [date, setDate] = useState<Date>()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`/api/telegram-posts?projectId=${projectId}`)
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
              views: post.views_count,
              reactions: post.reactions_count,
              shares: post.shares_count,
            },
          })),
        )
      } catch (error) {
        console.error("Error loading posts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [projectId])

  const [newPost, setNewPost] = useState("")
  const [postType, setPostType] = useState("text")

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
          status: "draft",
          scheduled_for: date?.toISOString() || null,
          created_by: null,
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
            views: savedPost.views_count,
            reactions: savedPost.reactions_count,
            shares: savedPost.shares_count,
          },
        },
        ...prev,
      ])
      setNewPost("")
    } catch (error) {
      console.error("Error saving post:", error)
    }
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
          <TabsTrigger value="scheduled">定时发布</TabsTrigger>
          <TabsTrigger value="published">已发布</TabsTrigger>
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

              <div className="flex space-x-2">
                <Button variant="outline">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  添加图片
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
                <Button onClick={handleSavePost}>发布帖子</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>定时发布管理</CardTitle>
              <CardDescription>管理计划发布的帖子</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts
                  .filter((post) => post.status === "scheduled")
                  .map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">已安排</Badge>
                            <Badge variant="outline">{post.type}</Badge>
                            <span className="text-sm text-muted-foreground">发布时间: {post.scheduledFor}</span>
                          </div>
                          <p className="text-sm">{post.content}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>已发布帖子</CardTitle>
              <CardDescription>查看和管理已发布的帖子</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts
                  .filter((post) => post.status === "published")
                  .map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="default">已发布</Badge>
                            <Badge variant="outline">{post.type}</Badge>
                            <span className="text-sm text-muted-foreground">{post.publishedAt}</span>
                          </div>
                          <p className="text-sm mb-3">{post.content}</p>
                          {post.engagement && (
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>👁️ {post.engagement.views} 浏览</span>
                              <span>❤️ {post.engagement.reactions} 反应</span>
                              <span>📤 {post.engagement.shares} 分享</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,847</div>
                <p className="text-xs text-muted-foreground">+20% 较上周</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">频道成员</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,247</div>
                <p className="text-xs text-muted-foreground">+12% 较上周</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均互动率</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% 较上周</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>帖子表现分析</CardTitle>
              <CardDescription>各帖子的详细数据表现</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts
                  .filter((post) => post.engagement)
                  .map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate max-w-md">{post.content}</p>
                        <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{post.engagement?.views} 浏览</span>
                        <span>{post.engagement?.reactions} 反应</span>
                        <span>{post.engagement?.shares} 分享</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
