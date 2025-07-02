"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Twitter, MessageSquare, Download, Eye, Heart, Share } from "lucide-react"
import { getWebsiteAnalytics, getProjects } from "@/lib/database"

interface Project {
  id: string
  name: string
  status: string
  progress: number
}

interface AnalyticsDashboardProps {
  projects: Project[]
}

export default function AnalyticsDashboard({ projects }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedProjects, setSelectedProjects] = useState<string[]>(["project-1"])

  const [websiteStats, setWebsiteStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [projectsData, analyticsData] = await Promise.all([getProjects(), getWebsiteAnalytics()])

        // Process analytics data by project
        const statsByProject = projectsData.map((project) => {
          const projectAnalytics = analyticsData.filter((a) => a.project_id === project.id)
          const totalVisits = projectAnalytics.reduce((sum, a) => sum + a.visits, 0)
          const totalUniqueVisitors = projectAnalytics.reduce((sum, a) => sum + a.unique_visitors, 0)
          const totalPageViews = projectAnalytics.reduce((sum, a) => sum + a.page_views, 0)
          const avgTime =
            projectAnalytics.length > 0
              ? Math.round(
                  projectAnalytics.reduce((sum, a) => sum + a.avg_session_duration, 0) / projectAnalytics.length,
                )
              : 0

          return {
            project: project.name,
            visits: totalVisits,
            uniqueVisitors: totalUniqueVisitors,
            pageViews: totalPageViews,
            avgTime: `${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, "0")}`,
          }
        })

        setWebsiteStats(statsByProject)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [selectedTimeRange])

  const socialStats = [
    { platform: "Twitter", posts: 45, impressions: 125000, engagements: 8500, followers: 12400 },
    { platform: "Telegram", posts: 32, views: 89000, reactions: 3200, members: 5600 },
  ]

  const postLinks = [
    {
      id: 1,
      title: "DeFi协议发布公告",
      url: "https://t.co/abc123",
      platform: "Twitter",
      clicks: 1250,
      shares: 45,
      likes: 230,
    },
    {
      id: 2,
      title: "NFT市场更新",
      url: "https://t.me/xyz789",
      platform: "Telegram",
      clicks: 890,
      shares: 23,
      likes: 156,
    },
    {
      id: 3,
      title: "GameFi平台路线图",
      url: "https://t.co/def456",
      platform: "Twitter",
      clicks: 2100,
      shares: 78,
      likes: 445,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">数据统计</h2>
        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
              <SelectItem value="90d">90天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      <Tabs defaultValue="website" className="space-y-4">
        <TabsList>
          <TabsTrigger value="website">网站访问量</TabsTrigger>
          <TabsTrigger value="social">社交媒体</TabsTrigger>
          <TabsTrigger value="posts">帖子链接</TabsTrigger>
          <TabsTrigger value="comparison">项目对比</TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目网站访问统计</CardTitle>
              <CardDescription>各项目网站的访问数据对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {websiteStats.map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{stat.project}</h4>
                      <Badge variant="outline">项目 {index + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stat.visits.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">总访问量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stat.uniqueVisitors.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">独立访客</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stat.pageViews.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">页面浏览量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stat.avgTime}</div>
                        <div className="text-sm text-muted-foreground">平均访问时长</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{stat.platform} 数据</CardTitle>
                  {stat.platform === "Twitter" ? (
                    <Twitter className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">发布帖子</span>
                      <span className="font-medium">{stat.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {stat.platform === "Twitter" ? "展示次数" : "浏览量"}
                      </span>
                      <span className="font-medium">
                        {stat.impressions?.toLocaleString() || stat.views?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {stat.platform === "Twitter" ? "互动数" : "反应数"}
                      </span>
                      <span className="font-medium">
                        {stat.engagements?.toLocaleString() || stat.reactions?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {stat.platform === "Twitter" ? "关注者" : "成员数"}
                      </span>
                      <span className="font-medium">
                        {stat.followers?.toLocaleString() || stat.members?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>帖子链接访问统计</CardTitle>
              <CardDescription>查看各帖子链接的访问量和互动数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm font-medium">选择要查看的帖子:</span>
                  <div className="flex space-x-4">
                    {postLinks.map((post) => (
                      <div key={post.id} className="flex items-center space-x-2">
                        <Checkbox id={`post-${post.id}`} defaultChecked />
                        <label htmlFor={`post-${post.id}`} className="text-sm">
                          {post.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {postLinks.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{post.title}</h4>
                          <Badge variant="outline">{post.platform}</Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          查看详情
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">点击: {post.clicks}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Share className="w-4 h-4 text-green-500" />
                          <span className="text-sm">分享: {post.shares}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">点赞: {post.likes}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">{post.url}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目数据对比</CardTitle>
              <CardDescription>对比不同项目的整体表现</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                        {project.status === "active" ? "进行中" : "规划中"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">网站访问</span>
                          <span className="font-medium">{websiteStats[index]?.visits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">社交互动</span>
                          <span className="font-medium">{(Math.random() * 10000).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">项目进度</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
