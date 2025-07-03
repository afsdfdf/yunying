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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  CalendarIcon,
  Hash,
  ImageIcon,
  Video,
  Link,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ContentManagementProps {
  projectId: string
}

interface Template {
  id: string
  name: string
  category: string
  content: string
  platforms: string[]
  variables: string[]
  created_at: string
  project_id: string
}

interface ScheduledPost {
  id: string
  platform: string
  content: string
  scheduledTime: Date | null
  templateId: string
  status: string
  created_at: string
  project_id: string
}

export default function ContentManagement({ projectId }: ContentManagementProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  
  // 批量下单功能状态
  const [batchOrderData, setBatchOrderData] = useState({
    serviceIds: "",
    orderLinks: "",
    quantities: "",
    randomRange: { min: 100, max: 200 }
  })
  const [generatedResults, setGeneratedResults] = useState("")
  const [copied, setCopied] = useState(false)

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "announcement",
    content: "",
    platforms: [] as string[],
    variables: [] as string[],
  })

  const [newScheduledPost, setNewScheduledPost] = useState({
    platform: "twitter",
    content: "",
    scheduledTime: null as Date | null,
    templateId: "",
  })

  const templateCategories = [
    { value: "announcement", label: "公告", icon: "📢" },
    { value: "update", label: "更新", icon: "🔄" },
    { value: "marketing", label: "营销", icon: "📈" },
    { value: "community", label: "社区", icon: "👥" },
    { value: "technical", label: "技术", icon: "⚙️" },
    { value: "partnership", label: "合作", icon: "🤝" },
  ]

  const platforms = [
    { value: "twitter", label: "Twitter", icon: "🐦" },
    { value: "telegram", label: "Telegram", icon: "✈️" },
    { value: "discord", label: "Discord", icon: "💬" },
    { value: "medium", label: "Medium", icon: "📝" },
  ]

  const commonHashtags = [
    "#DeFi",
    "#Crypto",
    "#Blockchain",
    "#Web3",
    "#NFT",
    "#Bitcoin",
    "#Ethereum",
    "#Trading",
    "#Investment",
    "#Technology",
  ]

  const handleCreateTemplate = () => {
    const template = {
      ...newTemplate,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      project_id: projectId,
    }

    setTemplates((prev) => [template, ...prev])
    setNewTemplate({
      name: "",
      category: "announcement",
      content: "",
      platforms: [],
      variables: [],
    })
    setShowTemplateDialog(false)
  }

  const handleSchedulePost = () => {
    const post = {
      ...newScheduledPost,
      id: Date.now().toString(),
      status: "scheduled",
      created_at: new Date().toISOString(),
      project_id: projectId,
    }

    setScheduledPosts((prev) => [post, ...prev])
    setNewScheduledPost({
      platform: "twitter",
      content: "",
      scheduledTime: null,
      templateId: "",
    })
    setShowScheduleDialog(false)
  }

  const insertVariable = (variable: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      content: prev.content + `{${variable}}`,
    }))
  }

  const insertHashtag = (hashtag: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      content: prev.content + ` ${hashtag}`,
    }))
  }

  // 批量下单功能处理函数
  const generateBatchOrders = () => {
    const serviceIds = batchOrderData.serviceIds.split('\n').filter(id => id.trim())
    const orderLinks = batchOrderData.orderLinks.split('\n').filter(link => link.trim())
    const quantities = batchOrderData.quantities.split('\n').filter(qty => qty.trim())
    
    if (serviceIds.length === 0 || orderLinks.length === 0) {
      alert('请至少输入一个服务ID和下单链接')
      return
    }
    
    const results: string[] = []
    let qIndex = 0
    for (let i = 0; i < serviceIds.length; i++) {
      for (let j = 0; j < orderLinks.length; j++) {
        // 数量分配规则
        let quantity = quantities[qIndex] || quantities[0] || '100'
        // 处理随机数量生成
        if (quantity.includes(',')) {
          const [min, max] = quantity.split(',').map(n => parseInt(n.trim()))
          if (!isNaN(min) && !isNaN(max) && min <= max) {
            quantity = (Math.floor(Math.random() * (max - min + 1)) + min).toString()
          }
        }
        results.push(`${serviceIds[i]}|${orderLinks[j]}|${quantity}`)
        qIndex++
      }
    }
    setGeneratedResults(results.join('\n'))
  }

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(generatedResults)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const clearBatchOrderData = () => {
    setBatchOrderData({
      serviceIds: "",
      orderLinks: "",
      quantities: "",
      randomRange: { min: 100, max: 200 }
    })
    setGeneratedResults("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">内容管理</h2>
        <div className="flex space-x-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                新建模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建内容模板</DialogTitle>
                <DialogDescription>创建可重复使用的内容模板，支持变量和多平台</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">模板名称</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="输入模板名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-category">模板类别</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <span>
                                {cat.icon} {cat.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-content">模板内容</Label>
                    <Textarea
                      id="template-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="输入模板内容，使用 {变量名} 来插入动态内容"
                      rows={8}
                    />
                    <div className="text-sm text-muted-foreground">
                      字符数: {newTemplate.content.length} | 支持变量: {"{project_name}"}, {"{date}"}, {"{price}"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>适用平台</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map((platform) => (
                        <div key={platform.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`platform-${platform.value}`}
                            checked={newTemplate.platforms.includes(platform.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewTemplate((prev) => ({
                                  ...prev,
                                  platforms: [...prev.platforms, platform.value],
                                }))
                              } else {
                                setNewTemplate((prev) => ({
                                  ...prev,
                                  platforms: prev.platforms.filter((p) => p !== platform.value),
                                }))
                              }
                            }}
                          />
                          <label htmlFor={`platform-${platform.value}`} className="text-sm">
                            {platform.icon} {platform.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">快速插入变量</Label>
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {["project_name", "date", "price", "volume", "market_cap"].map((variable) => (
                        <Button
                          key={variable}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable)}
                          className="justify-start text-xs"
                        >
                          {"{" + variable + "}"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">常用标签</Label>
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {commonHashtags.slice(0, 8).map((hashtag) => (
                        <Button
                          key={hashtag}
                          variant="outline"
                          size="sm"
                          onClick={() => insertHashtag(hashtag)}
                          className="justify-start text-xs"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {hashtag.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">媒体选项</Label>
                    <div className="space-y-2 mt-2">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        添加图片
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Video className="w-4 h-4 mr-2" />
                        添加视频
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Link className="w-4 h-4 mr-2" />
                        添加链接
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateTemplate}>创建模板</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Clock className="w-4 h-4 mr-2" />
                定时发布
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>定时发布内容</DialogTitle>
                <DialogDescription>安排内容在指定时间自动发布</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>发布平台</Label>
                    <Select
                      value={newScheduledPost.platform}
                      onValueChange={(value) => setNewScheduledPost({ ...newScheduledPost, platform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.icon} {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>使用模板</Label>
                    <Select
                      value={newScheduledPost.templateId}
                      onValueChange={(value) => setNewScheduledPost({ ...newScheduledPost, templateId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择模板（可选）" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>发布内容</Label>
                  <Textarea
                    value={newScheduledPost.content}
                    onChange={(e) => setNewScheduledPost({ ...newScheduledPost, content: e.target.value })}
                    placeholder="输入要发布的内容"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>发布时间</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newScheduledPost.scheduledTime && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newScheduledPost.scheduledTime
                          ? format(newScheduledPost.scheduledTime, "PPP HH:mm")
                          : "选择发布时间"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newScheduledPost.scheduledTime}
                        onSelect={(date) => setNewScheduledPost({ ...newScheduledPost, scheduledTime: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSchedulePost}>安排发布</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">内容模板</TabsTrigger>
          <TabsTrigger value="scheduled">定时发布</TabsTrigger>
          <TabsTrigger value="hashtags">标签管理</TabsTrigger>
          <TabsTrigger value="batch-order">批量下单</TabsTrigger>
          <TabsTrigger value="approval">审核流程</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>内容模板库</CardTitle>
              <CardDescription>管理可重复使用的内容模板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无模板，点击上方按钮创建第一个模板</p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline">
                            {templateCategories.find((c) => c.value === template.category)?.icon}
                            {templateCategories.find((c) => c.value === template.category)?.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platforms.find((p) => p.value === platform)?.icon}
                              {platforms.find((p) => p.value === platform)?.label}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Copy className="w-3 h-3 mr-1" />
                            使用
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>定时发布管理</CardTitle>
              <CardDescription>管理已安排的定时发布内容</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无定时发布内容</p>
                  </div>
                ) : (
                  scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">
                            {platforms.find((p) => p.value === post.platform)?.icon}
                            {platforms.find((p) => p.value === post.platform)?.label}
                          </Badge>
                          <Badge
                            variant={
                              post.status === "scheduled"
                                ? "default"
                                : post.status === "published"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {post.status === "scheduled" ? "已安排" : post.status === "published" ? "已发布" : "失败"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {post.scheduledTime ? format(new Date(post.scheduledTime), "MM/dd HH:mm") : ""}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
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

        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>标签管理</CardTitle>
              <CardDescription>管理项目相关的标签和关键词</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input placeholder="添加新标签..." className="flex-1" />
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    添加
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {commonHashtags.map((hashtag, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{hashtag.slice(1)}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch-order" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                批量下单工具
              </CardTitle>
              <CardDescription>批量生成下单数据，支持服务ID与下单链接的全部组合（笛卡尔积），数量支持随机范围</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 输入区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 服务ID输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="service-ids">服务ID</Label>
                    <Textarea
                      id="service-ids"
                      placeholder="每行输入一个服务ID\n例如：\n1001\n1002\n1003"
                      value={batchOrderData.serviceIds}
                      onChange={(e) => setBatchOrderData({ ...batchOrderData, serviceIds: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">每行一个服务ID</p>
                  </div>

                  {/* 下单链接输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="order-links">下单链接</Label>
                    <Textarea
                      id="order-links"
                      placeholder="每行输入一个下单链接\n例如：\nhttps://example.com/order1\nhttps://example.com/order2"
                      value={batchOrderData.orderLinks}
                      onChange={(e) => setBatchOrderData({ ...batchOrderData, orderLinks: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">每行一个下单链接</p>
                  </div>

                  {/* 数量输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="quantities">下单数量</Label>
                    <Textarea
                      id="quantities"
                      placeholder="每行输入一个数量\n固定数量：100\n随机范围：100,200\n留空使用默认值"
                      value={batchOrderData.quantities}
                      onChange={(e) => setBatchOrderData({ ...batchOrderData, quantities: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      固定数量直接输入数字<br />
                      随机范围输入：最小值,最大值<br />
                      例如：100,200 表示100-200之间的随机数<br />
                      <span className="text-blue-700">数量分配规则：如果只输入一行，所有组合都用这一数量；多行则按顺序分配给每个组合，不够则用第1行</span>
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <Button onClick={generateBatchOrders} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    生成结果
                  </Button>
                  <Button variant="outline" onClick={clearBatchOrderData}>
                    清空数据
                  </Button>
                </div>

                {/* 生成结果 */}
                {generatedResults && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>生成结果</Label>
                      <Button variant="outline" size="sm" onClick={copyResults}>
                        {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "已复制" : "复制结果"}
                      </Button>
                    </div>
                    <Textarea
                      value={generatedResults}
                      readOnly
                      rows={10}
                      className="font-mono text-sm bg-gray-50"
                      placeholder="生成的结果将显示在这里..."
                    />
                    <p className="text-xs text-muted-foreground">
                      格式：服务ID|下单链接|数量
                    </p>
                  </div>
                )}

                {/* 使用说明 */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-blue-800 mb-2">使用说明</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>服务ID</strong>：每行输入一个服务ID</p>
                      <p>• <strong>下单链接</strong>：每行输入一个对应的下单链接</p>
                      <p>• <strong>数量</strong>：支持固定数量和随机范围</p>
                      <p>• <strong>随机数量</strong>：输入格式为"最小值,最大值"，如"100,200"</p>
                      <p>• <strong>结果格式</strong>：服务ID|下单链接|数量</p>
                      <p>• <span className="text-blue-700">生成规则：服务ID与下单链接全部组合，每个组合一条结果</span></p>
                      <p>• <span className="text-blue-700">数量分配：如只输入一行，所有组合用这一数量；多行则按顺序分配，不够用第1行</span></p>
                      <p>• <strong>推荐服务ID</strong>：</p>
                      <p>&nbsp;&nbsp;浏览量：1825, 1446</p>
                      <p>&nbsp;&nbsp;点赞：1238, 1793</p>
                      <p>&nbsp;&nbsp;转发：885, 1794</p>
                      <p>&nbsp;&nbsp;TG浏览量：1082, 1031</p>
                      <p>&nbsp;&nbsp;表情：1009, 1833</p>
                      <p>&nbsp;&nbsp;网站浏览量：1841</p>
                      <p>&nbsp;&nbsp;<span className="text-orange-600">前面贵的后面便宜</span></p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>内容审核</CardTitle>
              <CardDescription>管理内容发布的审核流程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        待审核
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-sm text-muted-foreground">需要审核的内容</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        已通过
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-sm text-muted-foreground">本周通过审核</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        需修改
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1</div>
                      <p className="text-sm text-muted-foreground">需要修改的内容</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8">
                  <p className="text-muted-foreground">审核流程功能开发中...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
