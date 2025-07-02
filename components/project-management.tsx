"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Plus, Edit, Trash2, Globe, Twitter, MessageSquare } from "lucide-react"
import { getProject, updateProject, getTasks } from "@/lib/database"

interface ProjectManagementProps {
  projectId: string
}

export default function ProjectManagement({ projectId }: ProjectManagementProps) {
  const [date, setDate] = useState<Date>()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const [projectInfo, setProjectInfo] = useState({
    website: "",
    twitter: "",
    telegram: "",
    description: "",
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [project, projectTasks] = await Promise.all([getProject(projectId), getTasks(projectId)])

        if (!project) {
          setLoading(false)
          return //  <-- skip further processing
        }

        setProjectInfo({
          website: project.website_url || "",
          twitter: project.twitter_handle || "",
          telegram: project.telegram_handle || "",
          description: project.description || "",
        })

        setTasks(
          projectTasks.map((task) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date,
          })),
        )
      } catch (error) {
        console.error("Error loading project data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId])

  const handleSaveProject = async () => {
    try {
      await updateProject(projectId, {
        website_url: projectInfo.website,
        twitter_handle: projectInfo.twitter,
        telegram_handle: projectInfo.telegram,
        description: projectInfo.description,
      })
      // Show success message
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">项目管理</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
      </div>

      {!loading && projectInfo.website === "" && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          未找到 <code className="font-mono">projects</code> / <code className="font-mono">tasks</code> 表。 请先访问{" "}
          <a href="/setup" className="underline font-medium">
            /setup
          </a>{" "}
          初始化数据库。
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">项目信息</TabsTrigger>
          <TabsTrigger value="tasks">任务管理</TabsTrigger>
          <TabsTrigger value="schedule">日程安排</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>管理项目的基本信息和社交媒体账号</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">官方网站</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="website"
                      value={projectInfo.website}
                      onChange={(e) => setProjectInfo({ ...projectInfo, website: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">推特账号</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="twitter"
                      value={projectInfo.twitter}
                      onChange={(e) => setProjectInfo({ ...projectInfo, twitter: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">电报群组</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="telegram"
                      value={projectInfo.telegram}
                      onChange={(e) => setProjectInfo({ ...projectInfo, telegram: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">项目描述</Label>
                <Textarea
                  id="description"
                  value={projectInfo.description}
                  onChange={(e) => setProjectInfo({ ...projectInfo, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveProject}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>任务列表</CardTitle>
              <CardDescription>管理项目相关的任务和待办事项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority === "high" ? "高优先级" : task.priority === "medium" ? "中优先级" : "低优先级"}
                        </Badge>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "default"
                              : task.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {task.status === "completed" ? "已完成" : task.status === "in-progress" ? "进行中" : "待开始"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">截止: {task.dueDate}</span>
                      </div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>日历视图</CardTitle>
                <CardDescription>查看和管理项目日程</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>今日日程</CardTitle>
                <CardDescription>今天的任务和会议安排</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">团队会议</p>
                      <p className="text-sm text-muted-foreground">10:00 - 11:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">推文发布</p>
                      <p className="text-sm text-muted-foreground">14:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">数据分析报告</p>
                      <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
