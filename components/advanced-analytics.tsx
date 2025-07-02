"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share,
  MessageSquare,
  Users,
  Download,
  Filter,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AdvancedAnalyticsProps {
  projectId: string
}

export default function AdvancedAnalytics({ projectId }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetrics, setSelectedMetrics] = useState(["engagement", "reach", "followers"])
  const [comparisonMode, setComparisonMode] = useState(false)

  // Sample data - replace with real API calls
  const engagementData = [
    { date: "2024-01-01", twitter: 1200, telegram: 800, total: 2000 },
    { date: "2024-01-02", twitter: 1350, telegram: 920, total: 2270 },
    { date: "2024-01-03", twitter: 1100, telegram: 750, total: 1850 },
    { date: "2024-01-04", twitter: 1500, telegram: 1100, total: 2600 },
    { date: "2024-01-05", twitter: 1800, telegram: 1200, total: 3000 },
    { date: "2024-01-06", twitter: 1600, telegram: 1050, total: 2650 },
    { date: "2024-01-07", twitter: 1900, telegram: 1300, total: 3200 },
  ]

  const platformData = [
    { name: "Twitter", value: 45, color: "#1DA1F2" },
    { name: "Telegram", value: 30, color: "#0088CC" },
    { name: "Discord", value: 15, color: "#5865F2" },
    { name: "Medium", value: 10, color: "#00AB6C" },
  ]

  const topPosts = [
    {
      id: 1,
      platform: "twitter",
      content: "🚀 Exciting news! Our DeFi protocol is launching next week...",
      engagement: 2450,
      reach: 15600,
      date: "2024-01-07",
    },
    {
      id: 2,
      platform: "telegram",
      content: "📊 Weekly market analysis: The DeFi space continues to grow...",
      engagement: 1890,
      reach: 8900,
      date: "2024-01-06",
    },
    {
      id: 3,
      platform: "twitter",
      content: "🔥 Join our community and be part of the future of finance!",
      engagement: 1650,
      reach: 12300,
      date: "2024-01-05",
    },
  ]

  const kpiMetrics = [
    {
      title: "总互动量",
      value: "24.5K",
      change: "+12.5%",
      trend: "up",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "总触达量",
      value: "156K",
      change: "+8.3%",
      trend: "up",
      icon: Eye,
      color: "text-blue-500",
    },
    {
      title: "新增关注",
      value: "1.2K",
      change: "+15.7%",
      trend: "up",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "分享次数",
      value: "3.4K",
      change: "-2.1%",
      trend: "down",
      icon: Share,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">高级数据分析</h2>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
              <SelectItem value="90d">90天</SelectItem>
              <SelectItem value="1y">1年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                <span className="text-muted-foreground ml-1">较上周</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">数据概览</TabsTrigger>
          <TabsTrigger value="engagement">互动分析</TabsTrigger>
          <TabsTrigger value="audience">受众分析</TabsTrigger>
          <TabsTrigger value="content">内容表现</TabsTrigger>
          <TabsTrigger value="competitors">竞品对比</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>互动趋势</CardTitle>
                <CardDescription>过去7天的互动数据变化</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="twitter"
                      stackId="1"
                      stroke="#1DA1F2"
                      fill="#1DA1F2"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="telegram"
                      stackId="1"
                      stroke="#0088CC"
                      fill="#0088CC"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>平台分布</CardTitle>
                <CardDescription>各平台互动占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {platformData.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }}></div>
                        <span className="text-sm">{platform.name}</span>
                      </div>
                      <span className="text-sm font-medium">{platform.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>热门内容</CardTitle>
              <CardDescription>表现最佳的帖子和内容</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{post.platform === "twitter" ? "🐦 Twitter" : "✈️ Telegram"}</Badge>
                        <span className="text-sm text-muted-foreground">{post.date}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{post.engagement.toLocaleString()}</div>
                        <div className="text-muted-foreground">互动</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.reach.toLocaleString()}</div>
                        <div className="text-muted-foreground">触达</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>互动深度分析</CardTitle>
              <CardDescription>详细的用户互动行为分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="text-2xl font-bold">8.5K</div>
                        <div className="text-sm text-muted-foreground">点赞</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Share className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">2.1K</div>
                        <div className="text-sm text-muted-foreground">分享</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">1.3K</div>
                        <div className="text-sm text-muted-foreground">评论</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">45K</div>
                        <div className="text-sm text-muted-foreground">浏览</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} />
                  <Line type="monotone" dataKey="telegram" stroke="#0088CC" strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>受众增长</CardTitle>
                <CardDescription>关注者数量变化趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>受众特征</CardTitle>
                <CardDescription>用户群体分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">活跃用户</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">新用户</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">回访用户</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>内容表现分析</CardTitle>
              <CardDescription>不同类型内容的表现对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">内容表现分析功能开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>竞品对比分析</CardTitle>
              <CardDescription>与同类项目的数据对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">竞品对比功能开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
