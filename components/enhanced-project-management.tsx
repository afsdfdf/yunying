"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Twitter,
  MessageSquare,
  CalendarIcon,
  DollarSign,
  Users,
  Target,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ProjectManagementProps {
  projectId: string
}

export default function EnhancedProjectManagement({ projectId }: ProjectManagementProps) {
  const [project, setProject] = useState({
    name: "",
    description: "",
    status: "planning",
    progress: 0,
    website_url: "",
    twitter_handle: "",
    telegram_handle: "",
    logo_url: "",
    token_symbol: "",
    token_contract: "",
    launch_date: null as Date | null,
    total_supply: "",
    market_cap: "",
  })

  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Task management
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    dueDate: null as Date | null,
    category: "development",
  })

  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)

  const taskCategories = [
    { value: "development", label: "开发" },
    { value: "marketing", label: "营销" },
    { value: "community", label: "社区" },
    { value: "legal", label: "法务" },
    { value: "design", label: "设计" },
    { value: "research", label: "研究" },
  ]

  const priorityLevels = [
    { value: "low", label: "低", color: "bg-gray-500" },
    { value: "medium", label: "中", color: "bg-yellow-500" },
    { value: "high", label: "高", color: "bg-orange-500" },
    { value: "urgent", label: "紧急", color: "bg-red-500" },
  ]

  const statusOptions = [
    { value: "planning", label: "规划中", color: "bg-blue-500" },
    { value: "development", label: "开发中", color: "bg-purple-500" },
    { value: "testing", label: "测试中", color: "bg-orange-500" },
    { value: "active", label: "已上线", color: "bg-green-500" },
    { value: "maintenance", label: "维护中", color: "bg-gray-500" },
    { value: "completed", label: "已完成", color: "bg-green-600" },
  ]

  const handleSaveProject = async () => {
    try {
      // Save project data
      console.log("Saving project:", project)
      // TODO: Implement API call
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  const handleCreateTask = async () => {
    try {
      const task = {
        ...newTask,
        id: Date.now().toString(),
        status: "pending",
        created_at: new Date().toISOString(),
        project_id: projectId,
      }

      setTasks((prev) => [task, ...prev])
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignee: "",
        dueDate: null,
        category: "development",
      })
      setShowNewTaskDialog(false)
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const calculateProgress = () => {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">项目管理</h2>
        <div className="flex space-x-2">
          <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建任务
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新任务</DialogTitle>
                <DialogDescription>为项目添加新的任务或待办事项</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">任务标题</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="输入任务标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-category">任务类别</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">任务描述</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="详细描述任务内容和要求"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>优先级</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                              <span>{level.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>负责人</Label>
                    <Select
                      value={newTask.assignee}
                      onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择负责人" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>截止日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newTask.dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : "选择日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateTask}>创建任务</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">项目概览</TabsTrigger>
          <TabsTrigger value="details">项目详情</TabsTrigger>
          <TabsTrigger value="tasks">任务管理</TabsTrigger>
          <TabsTrigger value="milestones">里程碑</TabsTrigger>
          <TabsTrigger value="team">团队管理</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">项目进度</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateProgress()}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃任务</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status !== "completed").length}</div>
                <p className="text-xs text-muted-foreground">总共 {tasks.length} 个任务</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">团队成员</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">活跃成员</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">市值</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${project.market_cap || "0"}</div>
                <p className="text-xs text-muted-foreground">当前估值</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>项目状态概览</CardTitle>
              <CardDescription>当前项目的整体状态和关键信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">项目状态</span>
                    <Badge variant="default" className="bg-blue-500">
                      {statusOptions.find((s) => s.value === project.status)?.label || "未知"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">代币符号</span>
                    <span className="font-mono">{project.token_symbol || "未设置"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">总供应量</span>
                    <span>{project.total_supply ? Number(project.total_supply).toLocaleString() : "未设置"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">预计上线</span>
                    <span>{project.launch_date ? format(project.launch_date, "PPP") : "待定"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">官网状态</span>
                    <Badge variant={project.website_url ? "default" : "outline"}>
                      {project.website_url ? "已配置" : "未配置"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">社交媒体</span>
                    <div className="flex space-x-1">
                      <Badge variant={project.twitter_handle ? "default" : "outline"} className="text-xs">
                        Twitter
                      </Badge>
                      <Badge variant={project.telegram_handle ? "default" : "outline"} className="text-xs">
                        Telegram
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目基本信息</CardTitle>
              <CardDescription>管理项目的详细信息和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">项目名称</Label>
                  <Input
                    id="project-name"
                    value={project.name}
                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-status">项目状态</Label>
                  <Select value={project.status} onValueChange={(value) => setProject({ ...project, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">项目描述</Label>
                <Textarea
                  id="project-description"
                  value={project.description}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  rows={4}
                  placeholder="详细描述项目的目标、特点和价值主张"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">代币符号</Label>
                  <Input
                    id="token-symbol"
                    value={project.token_symbol}
                    onChange={(e) => setProject({ ...project, token_symbol: e.target.value.toUpperCase() })}
                    placeholder="如: BTC, ETH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-supply">总供应量</Label>
                  <Input
                    id="total-supply"
                    type="number"
                    value={project.total_supply}
                    onChange={(e) => setProject({ ...project, total_supply: e.target.value })}
                    placeholder="1000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market-cap">市值 (USD)</Label>
                  <Input
                    id="market-cap"
                    type="number"
                    value={project.market_cap}
                    onChange={(e) => setProject({ ...project, market_cap: e.target.value })}
                    placeholder="1000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="launch-date">预计上线日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !project.launch_date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {project.launch_date ? format(project.launch_date, "PPP") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={project.launch_date}
                        onSelect={(date) => setProject({ ...project, launch_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-contract">合约地址</Label>
                  <Input
                    id="token-contract"
                    value={project.token_contract}
                    onChange={(e) => setProject({ ...project, token_contract: e.target.value })}
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">官方网站</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="website"
                      value={project.website_url}
                      onChange={(e) => setProject({ ...project, website_url: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <Button variant="outline" size="icon">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter 账号</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="twitter"
                      value={project.twitter_handle}
                      onChange={(e) => setProject({ ...project, twitter_handle: e.target.value })}
                      placeholder="@username"
                    />
                    <Button variant="outline" size="icon">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram 群组</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="telegram"
                      value={project.telegram_handle}
                      onChange={(e) => setProject({ ...project, telegram_handle: e.target.value })}
                      placeholder="@groupname"
                    />
                    <Button variant="outline" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProject}>保存项目信息</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>任务管理</CardTitle>
              <CardDescription>管理项目相关的任务和待办事项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">暂无任务，点击上方按钮创建第一个任务</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge variant="outline">
                            {taskCategories.find((c) => c.value === task.category)?.label}
                          </Badge>
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              task.priority === "urgent" || task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {priorityLevels.find((p) => p.value === task.priority)?.label}
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
                            {task.status === "completed"
                              ? "已完成"
                              : task.status === "in-progress"
                                ? "进行中"
                                : "待开始"}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-sm text-muted-foreground">
                              截止: {format(new Date(task.dueDate), "MM/dd")}
                            </span>
                          )}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目里程碑</CardTitle>
              <CardDescription>设置和跟踪项目的重要里程碑</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加里程碑
                </Button>

                <div className="space-y-4">
                  {/* Milestone timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Sample milestones */}
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          ✓
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">项目启动</h4>
                          <p className="text-sm text-muted-foreground">完成项目规划和团队组建</p>
                          <span className="text-xs text-muted-foreground">已完成 - 2024年1月</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">MVP 开发</h4>
                          <p className="text-sm text-muted-foreground">完成最小可行产品开发</p>
                          <span className="text-xs text-muted-foreground">进行中 - 预计2024年3月</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">测试网发布</h4>
                          <p className="text-sm text-muted-foreground">在测试网络上发布产品</p>
                          <span className="text-xs text-muted-foreground">计划中 - 2024年4月</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>团队管理</CardTitle>
              <CardDescription>管理项目团队成员和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  邀请成员
                </Button>

                <div className="text-center py-8">
                  <p className="text-muted-foreground">团队成员功能开发中...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
