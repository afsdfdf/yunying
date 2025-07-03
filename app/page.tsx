"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Calendar, Twitter, MessageSquare, Globe, Settings, FileText, ImageIcon, Sparkles } from "lucide-react"
import ProjectSelector from "@/components/project-selector"
import EnhancedProjectManagement from "@/components/enhanced-project-management"
import EnhancedTwitterManagement from "@/components/enhanced-twitter-management"
import EnhancedTelegramManagement from "@/components/enhanced-telegram-management"
import EnhancedImageLibrary from "@/components/enhanced-image-library"
import ContentPlanner from "@/components/content-planner"
import AdvancedAnalytics from "@/components/advanced-analytics"
import UserManagement from "@/components/user-management"
import ContentManagement from "@/components/content-management"
import CreateProjectDialog from "@/components/create-project-dialog"
import Image from "next/image"

export default function Dashboard() {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState("project-1")
  const [activeTab, setActiveTab] = useState("overview")

  const [projects, setProjects] = useState([
    {
      id: "demo-project-1",
      name: "DeFi Protocol Alpha",
      status: "active",
      progress: 75,
    },
    {
      id: "demo-project-2",
      name: "NFT Marketplace Beta",
      status: "planning",
      progress: 30,
    },
    {
      id: "demo-project-3",
      name: "GameFi Platform",
      status: "active",
      progress: 90,
    },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { projects: data } = await res.json()

        if (data && data.length > 0) {
          setProjects(
            data.map((project: any) => ({
              id: project.id,
              name: project.name,
              status: project.status,
              progress: project.progress,
            })),
          )
          setSelectedProject(data[0].id)
        } else {
          // 使用演示数据
          setSelectedProject("demo-project-1")
        }
      } catch (error) {
        console.error("Error loading projects:", error)
        // 使用演示数据
        setSelectedProject("demo-project-1")
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleProjectCreated = (newProject: any) => {
    setProjects((prev) => [
      ...prev,
      {
        id: newProject.id,
        name: newProject.name,
        status: newProject.status,
        progress: newProject.progress || 0,
      },
    ])
    setSelectedProject(newProject.id)
  }

  const currentProject = projects.find((p) => p.id === selectedProject)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">加密项目运营系统</h1>
            <ProjectSelector
              onProjectChange={setSelectedProject}
              currentProjectId={selectedProject}
            />
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://tglaren.com/services"
              target="_blank"
              rel="noopener noreferrer"
              title="电报拉人网 tglaren.com"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
            >
              <Image src="https://tglaren.com/favicon.ico" alt="tglaren" width={24} height={24} />
            </a>
            <a
              href="https://crazysmm.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="crazysmm.com"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
            >
              <Image src="https://crazysmm.com/favicon.ico" alt="crazysmm" width={24} height={24} />
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(selectedProject ? `/settings?project=${selectedProject}` : "/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              项目概览
            </Button>
            <Button
              variant={activeTab === "management" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("management")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              项目管理
            </Button>
            <Button
              variant={activeTab === "content" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("content")}
            >
              <FileText className="w-4 h-4 mr-2" />
              内容管理
            </Button>
            <Button
              variant={activeTab === "planner" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("planner")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              内容策划
            </Button>
            <Button
              variant={activeTab === "twitter" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("twitter")}
            >
              <Twitter className="w-4 h-4 mr-2" />
              推特管理
            </Button>
            <Button
              variant={activeTab === "telegram" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("telegram")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              电报管理
            </Button>
            <Button
              variant={activeTab === "images" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("images")}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              图片库
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("analytics")}
            >
              <Globe className="w-4 h-4 mr-2" />
              数据分析
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="w-4 h-4 mr-2" />
              用户管理
            </Button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Project Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">当前项目</CardTitle>
                    <Badge variant={currentProject?.status === "active" ? "default" : "secondary"}>
                      {currentProject?.status === "active" ? "进行中" : "规划中"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentProject?.name || "请选择项目"}</div>
                    <p className="text-xs text-muted-foreground">进度: {currentProject?.progress || 0}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">今日推文</CardTitle>
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">等待发布</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">网站访问量</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12.5K</div>
                    <p className="text-xs text-muted-foreground">今日访问</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                  <CardDescription>常用功能快速入口</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col" onClick={() => setActiveTab("twitter")}>
                      <Twitter className="h-8 w-8 mb-2" />
                      <span>发布推文</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col" onClick={() => setActiveTab("telegram")}>
                      <MessageSquare className="h-8 w-8 mb-2" />
                      <span>发布电报</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col" onClick={() => setActiveTab("images")}>
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span>管理图片</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col" onClick={() => setActiveTab("planner")}>
                      <Sparkles className="h-8 w-8 mb-2" />
                      <span>内容策划</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>项目的最新动态和活动</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Twitter className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">推文已发布</p>
                        <p className="text-xs text-muted-foreground">
                          "我们很高兴宣布新功能即将上线！敬请期待更多详情。#加密货币 #区块链"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2小时前</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">电报公告已发布</p>
                        <p className="text-xs text-muted-foreground">
                          "社区AMA活动将于本周五举行，欢迎大家参与！"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">昨天</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">新增团队成员</p>
                        <p className="text-xs text-muted-foreground">李明加入了项目团队，担任市场营销经理</p>
                        <p className="text-xs text-muted-foreground mt-1">2天前</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "management" && <EnhancedProjectManagement projectId={selectedProject} />}
          {activeTab === "content" && <ContentManagement projectId={selectedProject} />}
          {activeTab === "planner" && <ContentPlanner projectId={selectedProject} />}
          {activeTab === "twitter" && <EnhancedTwitterManagement projectId={selectedProject} />}
          {activeTab === "telegram" && <EnhancedTelegramManagement projectId={selectedProject} />}
          {activeTab === "images" && <EnhancedImageLibrary projectId={selectedProject} />}
          {activeTab === "analytics" && <AdvancedAnalytics projectId={selectedProject} />}
          {activeTab === "users" && <UserManagement />}
        </main>
      </div>
    </div>
  )
}
