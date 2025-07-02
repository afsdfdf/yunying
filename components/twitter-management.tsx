"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Send, Calendar, BarChart3, Edit, Trash2 } from "lucide-react"
// 用 `fetch` 访问新建的 API，而非直接调用数据库 helper（后者只能在服务端）。
import ImageUpload from "./image-upload"
import BatchUploadDialog from "./batch-upload-dialog"

interface TwitterManagementProps {
  projectId: string
}

export default function TwitterManagement({ projectId }: TwitterManagementProps) {
  const [tweets, setTweets] = useState<
    {
      id: string
      content: string
      status: string
      publishedAt: string | null
      scheduledFor: string | null
      engagement: { likes: number; retweets: number; replies: number }
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [newTweet, setNewTweet] = useState("")
  const [bulkTweets, setBulkTweets] = useState("")
  const [tweetTargets, setTweetTargets] = useState({
    likes: 100,
    retweets: 50,
    replies: 20,
  })

  const loadTweets = async () => {
    try {
      const res = await fetch(`/api/twitter-posts?projectId=${projectId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || json.details)

      setTweets(
        json.tweets.map((t: any) => ({
          id: t.id,
          content: t.content,
          status: t.status,
          publishedAt: t.published_at,
          scheduledFor: t.scheduled_for,
          engagement: {
            likes: t.likes_count,
            retweets: t.retweets_count,
            replies: t.replies_count,
          },
        })),
      )
    } catch (err) {
      console.error("Error loading tweets:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTweets()
  }, [projectId])

  const handleSaveTweet = async () => {
    if (!newTweet.trim()) return

    try {
      const res = await fetch("/api/twitter-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          content: newTweet,
          status: "draft",
          created_by: null,
          target_likes: tweetTargets.likes,
          target_retweets: tweetTargets.retweets,
          target_replies: tweetTargets.replies,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || json.details)

      const savedTweet = json.tweet
      setTweets((prev) => [
        {
          id: savedTweet.id,
          content: savedTweet.content,
          status: savedTweet.status,
          publishedAt: savedTweet.published_at,
          scheduledFor: savedTweet.scheduled_for,
          engagement: {
            likes: savedTweet.likes_count,
            retweets: savedTweet.retweets_count,
            replies: savedTweet.replies_count,
          },
        },
        ...prev,
      ])
    } catch (err) {
      console.error("Error saving tweet:", err)
    }
    setNewTweet("")
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
              // 刷新推文列表
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
          <TabsTrigger value="bulk">批量管理</TabsTrigger>
          <TabsTrigger value="published">已发布</TabsTrigger>
          <TabsTrigger value="images">图片管理</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>撰写新推文</CardTitle>
              <CardDescription>创建和编辑推文内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tweet-content">推文内容</Label>
                <Textarea
                  id="tweet-content"
                  placeholder="输入推文内容..."
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{newTweet.length}/280 字符</span>
                  <span>剩余: {280 - newTweet.length}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  添加图片
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  定时发布
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">保存草稿</Button>
                <Button onClick={handleSaveTweet}>立即发布</Button>
              </div>
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

        <TabsContent value="published" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>推文列表</CardTitle>
              <CardDescription>管理已发布和计划发布的推文</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{tweet.content}</p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              tweet.status === "published"
                                ? "default"
                                : tweet.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {tweet.status === "published" ? "已发布" : tweet.status === "scheduled" ? "已安排" : "草稿"}
                          </Badge>
                          {tweet.status === "published" && tweet.publishedAt && (
                            <span className="text-xs text-muted-foreground">发布于: {tweet.publishedAt}</span>
                          )}
                          {tweet.status === "scheduled" && tweet.scheduledFor && (
                            <span className="text-xs text-muted-foreground">计划于: {tweet.scheduledFor}</span>
                          )}
                        </div>
                        {tweet.engagement && (
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>👍 {tweet.engagement.likes}</span>
                            <span>🔄 {tweet.engagement.retweets}</span>
                            <span>💬 {tweet.engagement.replies}</span>
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

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>图片管理</CardTitle>
              <CardDescription>上传和管理推文图片</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                projectId={projectId}
                multiple={true}
                maxFiles={10}
                onImageUploaded={(image) => {
                  console.log("Image uploaded:", image)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
