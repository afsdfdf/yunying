"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Calendar, Twitter, MessageSquare, Globe, Settings, Database, FileText } from "lucide-react"
import ProjectSelector from "@/components/project-selector"
import EnhancedProjectManagement from "@/components/enhanced-project-management"
import TwitterManagement from "@/components/twitter-management"
import TelegramManagement from "@/components/telegram-management"
import AdvancedAnalytics from "@/components/advanced-analytics"
import UserManagement from "@/components/user-management"
import ContentManagement from "@/components/content-management"
import CreateProjectDialog from "@/components/create-project-dialog"
import DatabaseConnectionStatus from "@/components/database-connection-status"

export default function Dashboard() {
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
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false)

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
              projects={projects}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}>
              <Database className="w-4 h-4 mr-2" />
              数据库状态
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>
      </header>

      {/* Database Status Panel */}
      {showDatabaseStatus && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <DatabaseConnectionStatus />
        </div>
      )}

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
        <main className="flex-1 p-6">
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
                    <Button
                      variant="outline"
                      className="h-20 flex-col bg-transparent"
                      onClick={() => setActiveTab("content")}
                    >
                      <FileText className="w-6 h-6 mb-2" />
                      创建内容
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col bg-transparent"
                      onClick={() => setActiveTab("twitter")}
                    >
                      <Twitter className="w-6 h-6 mb-2" />
                      发布推文
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col bg-transparent"
                      onClick={() => setActiveTab("management")}
                    >
                      <Calendar className="w-6 h-6 mb-2" />
                      管理任务
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col bg-transparent"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <BarChart3 className="w-6 h-6 mb-2" />
                      查看数据
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>项目最新动态和更新</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">发布了新推文</p>
                        <p className="text-sm text-muted-foreground">2小时前 - DeFi Protocol Alpha</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">完成了白皮书任务</p>
                        <p className="text-sm text-muted-foreground">5小时前 - NFT Marketplace Beta</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">更新了项目进度</p>
                        <p className="text-sm text-muted-foreground">1天前 - GameFi Platform</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>系统状态</CardTitle>
                  <CardDescription>当前系统运行状态</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">数据库连接</p>
                        <p className="text-xs text-muted-foreground">正常运行</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">API 服务</p>
                        <p className="text-xs text-muted-foreground">正常运行</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">社交媒体</p>
                        <p className="text-xs text-muted-foreground">待配置</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "management" && selectedProject && <EnhancedProjectManagement projectId={selectedProject} />}

          {activeTab === "content" && selectedProject && <ContentManagement projectId={selectedProject} />}

          {activeTab === "twitter" && selectedProject && <TwitterManagement projectId={selectedProject} />}

          {activeTab === "telegram" && selectedProject && <TelegramManagement projectId={selectedProject} />}

          {activeTab === "analytics" && selectedProject && <AdvancedAnalytics projectId={selectedProject} />}

          {activeTab === "users" && <UserManagement />}

          {!selectedProject && activeTab !== "overview" && activeTab !== "users" && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">请先选择项目</h3>
              <p className="text-muted-foreground mb-4">选择一个项目来开始管理相关功能</p>
              <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
