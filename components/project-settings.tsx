"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Save, AlertTriangle, Globe, Twitter, MessageSquare, Settings, Users, Shield, Database } from "lucide-react"

interface ProjectSettingsProps {
  projectId: string
  onProjectDeleted?: () => void
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  website_url?: string
  twitter_handle?: string
  telegram_handle?: string
  logo_url?: string
  token_symbol?: string
  token_contract?: string
  launch_date?: string
  total_supply?: string
  market_cap?: string
  created_at: string
}

export default function ProjectSettings({ projectId, onProjectDeleted }: ProjectSettingsProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const statusOptions = [
    { value: "planning", label: "规划中", color: "bg-blue-500" },
    { value: "development", label: "开发中", color: "bg-purple-500" },
    { value: "testing", label: "测试中", color: "bg-orange-500" },
    { value: "active", label: "已上线", color: "bg-green-500" },
    { value: "maintenance", label: "维护中", color: "bg-gray-500" },
    { value: "completed", label: "已完成", color: "bg-green-600" },
  ]

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      } else {
        toast({
          title: "错误",
          description: "加载项目信息失败",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("加载项目失败:", error)
      toast({
        title: "错误",
        description: "加载项目信息失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProject = async () => {
    if (!project) return

    try {
      setSaving(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "项目信息已保存",
        })
      } else {
        const error = await response.json()
        toast({
          title: "错误",
          description: error.error || "保存失败",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("保存项目失败:", error)
      toast({
        title: "错误",
        description: "保存项目信息失败",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project || deleteConfirmation !== project.name) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "项目已删除",
        })
        onProjectDeleted?.()
        router.push("/")
      } else {
        const error = await response.json()
        toast({
          title: "错误",
          description: error.error || "删除失败",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("删除项目失败:", error)
      toast({
        title: "错误",
        description: "删除项目失败",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">项目不存在</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">项目设置</h2>
          <p className="text-muted-foreground">管理项目信息和配置</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSaveProject} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "保存中..." : "保存更改"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">基本信息</TabsTrigger>
          <TabsTrigger value="social">社交媒体</TabsTrigger>
          <TabsTrigger value="token">代币信息</TabsTrigger>
          <TabsTrigger value="danger">危险操作</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>管理项目的基本信息和状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">项目名称</Label>
                  <Input
                    id="project-name"
                    value={project.name}
                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                    placeholder="输入项目名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-status">项目状态</Label>
                  <Select
                    value={project.status}
                    onValueChange={(value) => setProject({ ...project, status: value })}
                  >
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
                  value={project.description || ""}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  placeholder="详细描述项目的目标、特点和价值主张"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-website">官方网站</Label>
                <div className="flex space-x-2">
                  <Input
                    id="project-website"
                    value={project.website_url || ""}
                    onChange={(e) => setProject({ ...project, website_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <Button variant="outline" size="icon">
                    <Globe className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>社交媒体</CardTitle>
              <CardDescription>管理项目的社交媒体账号</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-handle">Twitter 账号</Label>
                <div className="flex space-x-2">
                  <Input
                    id="twitter-handle"
                    value={project.twitter_handle || ""}
                    onChange={(e) => setProject({ ...project, twitter_handle: e.target.value })}
                    placeholder="@username"
                  />
                  <Button variant="outline" size="icon">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-handle">Telegram 群组</Label>
                <div className="flex space-x-2">
                  <Input
                    id="telegram-handle"
                    value={project.telegram_handle || ""}
                    onChange={(e) => setProject({ ...project, telegram_handle: e.target.value })}
                    placeholder="@groupname"
                  />
                  <Button variant="outline" size="icon">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="token" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>代币信息</CardTitle>
              <CardDescription>管理项目的代币相关信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">代币符号</Label>
                  <Input
                    id="token-symbol"
                    value={project.token_symbol || ""}
                    onChange={(e) => setProject({ ...project, token_symbol: e.target.value.toUpperCase() })}
                    placeholder="如: BTC, ETH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-supply">总供应量</Label>
                  <Input
                    id="total-supply"
                    type="number"
                    value={project.total_supply || ""}
                    onChange={(e) => setProject({ ...project, total_supply: e.target.value })}
                    placeholder="1000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market-cap">市值 (USD)</Label>
                  <Input
                    id="market-cap"
                    type="number"
                    value={project.market_cap || ""}
                    onChange={(e) => setProject({ ...project, market_cap: e.target.value })}
                    placeholder="1000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-contract">代币合约地址</Label>
                <Input
                  id="token-contract"
                  value={project.token_contract || ""}
                  onChange={(e) => setProject({ ...project, token_contract: e.target.value })}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="launch-date">发行日期</Label>
                <Input
                  id="launch-date"
                  type="date"
                  value={project.launch_date ? project.launch_date.split('T')[0] : ""}
                  onChange={(e) => setProject({ ...project, launch_date: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                危险操作
              </CardTitle>
              <CardDescription>这些操作不可逆，请谨慎操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">删除项目</h4>
                <p className="text-sm text-red-700 mb-4">
                  删除项目将永久移除所有相关数据，包括：
                </p>
                <ul className="text-sm text-red-700 space-y-1 mb-4">
                  <li>• 所有推文和电报帖子</li>
                  <li>• 所有图片和媒体文件</li>
                  <li>• 所有任务和里程碑</li>
                  <li>• 项目配置和设置</li>
                </ul>
                <p className="text-sm text-red-700 font-medium">
                  此操作不可撤销，请确保您真的要删除此项目。
                </p>
              </div>

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除项目
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除项目</AlertDialogTitle>
                    <AlertDialogDescription>
                      您即将删除项目 <strong>{project.name}</strong>。此操作将永久删除所有相关数据且不可撤销。
                      <br /><br />
                      请输入项目名称 <strong>{project.name}</strong> 以确认删除：
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="输入项目名称确认删除"
                      className="w-full"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProject}
                      disabled={deleteConfirmation !== project.name || deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "删除中..." : "确认删除"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 