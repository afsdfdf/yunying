"use client"

import { useState } from "react"
import { groqService, GeneratedContent } from "@/lib/groq-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Calendar as CalendarIcon,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  Twitter,
  MessageSquare,
  FileText,
  Check,
  Loader2,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ContentPlannerProps {
  projectId: string
}

interface ContentPlan {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  platforms: string[]
  contentTypes: string[]
  topics: string[]
  generatedContent: GeneratedContent[]
}

export default function ContentPlanner({ projectId }: ContentPlannerProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [plans, setPlans] = useState<ContentPlan[]>([])
  const [activePlan, setActivePlan] = useState<ContentPlan | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后
    platforms: ["twitter", "telegram"],
    contentTypes: ["announcement", "education", "community"],
    topics: "",
    contentCount: 10,
    tone: "professional",
    language: "english",
    includeTranslation: true,
    includeImagePrompt: true,
  })

  const platformOptions = [
    { value: "twitter", label: "Twitter" },
    { value: "telegram", label: "Telegram" },
    { value: "discord", label: "Discord" },
  ]

  const contentTypeOptions = [
    { value: "announcement", label: "项目公告" },
    { value: "education", label: "教育内容" },
    { value: "community", label: "社区互动" },
    { value: "ama", label: "AMA问答" },
    { value: "promotion", label: "活动推广" },
    { value: "partnership", label: "合作伙伴" },
    { value: "tutorial", label: "使用教程" },
    { value: "news", label: "行业新闻" },
  ]

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => {
      if (prev.platforms.includes(platform)) {
        return { ...prev, platforms: prev.platforms.filter(p => p !== platform) }
      } else {
        return { ...prev, platforms: [...prev.platforms, platform] }
      }
    })
  }

  const handleContentTypeToggle = (type: string) => {
    setFormData(prev => {
      if (prev.contentTypes.includes(type)) {
        return { ...prev, contentTypes: prev.contentTypes.filter(t => t !== type) }
      } else {
        return { ...prev, contentTypes: [...prev.contentTypes, type] }
      }
    })
  }

  const handleGeneratePlan = async () => {
    if (!formData.title || !formData.description) return

    setGenerating(true)
    
    try {
      // 调用GROQ API生成内容
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content-plan',
          projectName: formData.title,
          projectDescription: formData.description,
          contentType: formData.contentTypes[0],
          platform: formData.platforms[0],
          topics: formData.topics.split(',').map(t => t.trim()),
          tone: formData.tone,
          language: formData.language,
          count: formData.contentCount,
          includeTranslation: formData.includeTranslation,
          includeImagePrompt: formData.includeImagePrompt,
          platforms: formData.platforms,
          contentTypes: formData.contentTypes,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('内容生成失败')
      }

      const result = await response.json()
      
      if (result.success) {
        const newPlan: ContentPlan = {
          id: `plan-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          platforms: formData.platforms,
          contentTypes: formData.contentTypes,
          topics: formData.topics.split(',').map(t => t.trim()),
          generatedContent: result.data.generatedContent || [],
        }
        
        setPlans(prev => [newPlan, ...prev])
        setActivePlan(newPlan)
      } else {
        throw new Error(result.error || '内容生成失败')
      }
    } catch (error) {
      console.error("Error generating content plan:", error)
      // 如果AI生成失败，使用备用方案
      const newPlan: ContentPlan = {
        id: `plan-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        platforms: formData.platforms,
        contentTypes: formData.contentTypes,
        topics: formData.topics.split(',').map(t => t.trim()),
        generatedContent: generateSampleContent(formData.contentCount),
      }
      
      setPlans(prev => [newPlan, ...prev])
      setActivePlan(newPlan)
    } finally {
      setGenerating(false)
    }
  }

  const generateSampleTweets = (count: number) => {
    const templates = [
      "我们很高兴宣布 #项目名称# 将于下周推出新功能！敬请关注更多详情。 #加密货币 #区块链",
      "了解 #项目名称# 如何通过创新技术解决行业痛点。点击链接了解更多！",
      "参与我们的社区AMA活动，与团队直接交流并赢取奖励！详情请关注。 #社区 #AMA",
      "新的教程上线！学习如何使用 #项目名称# 的核心功能，提升您的使用体验。",
      "我们正在寻找合作伙伴！如果您对与 #项目名称# 合作感兴趣，请联系我们的团队。",
      "#项目名称# 的代币经济模型解析 - 了解我们如何设计可持续的生态系统。",
      "感谢社区的支持！我们刚刚达到了一个重要里程碑。 #感谢 #社区",
      "安全提示：保护您的加密资产安全的5个关键步骤。 #安全 #加密货币",
      "市场分析：当前趋势如何影响 #项目名称# 的发展方向。",
      "参与我们的赏金计划，帮助改进产品并获得奖励！ #赏金 #奖励"
    ]
    
    return Array(count).fill(0).map((_, i) => {
      const template = templates[i % templates.length]
      return template.replace('#项目名称#', formData.title)
    })
  }

  const generateSampleContent = (count: number): GeneratedContent[] => {
    const templates = [
      {
        englishContent: "We are excited to announce #项目名称# will launch new features next week! Stay tuned for more details. #crypto #blockchain",
        chineseTranslation: "我们很高兴宣布 #项目名称# 将于下周推出新功能！敬请关注更多详情。 #加密货币 #区块链",
        imagePrompt: "A modern interface with glowing elements and blockchain visualization",
        hashtags: ["#crypto", "#blockchain", "#newfeature"],
        suggestedTime: "2024-01-15T10:00:00Z"
      },
      {
        englishContent: "Learn how #项目名称# solves industry pain points through innovative technology. Click the link to learn more!",
        chineseTranslation: "了解 #项目名称# 如何通过创新技术解决行业痛点。点击链接了解更多！",
        imagePrompt: "A group of people in a virtual meeting discussing technology",
        hashtags: ["#innovation", "#technology", "#solution"],
        suggestedTime: "2024-01-16T15:00:00Z"
      }
    ]
    
    return Array(count).fill(0).map((_, i) => {
      const template = templates[i % templates.length]
      return {
        englishContent: template.englishContent.replace('#项目名称#', formData.title),
        chineseTranslation: template.chineseTranslation.replace('#项目名称#', formData.title),
        imagePrompt: template.imagePrompt,
        hashtags: template.hashtags,
        suggestedTime: template.suggestedTime
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">内容策划工具</h2>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">创建策划</TabsTrigger>
          <TabsTrigger value="plans">策划方案</TabsTrigger>
          <TabsTrigger value="calendar">内容日历</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>创建内容策划方案</CardTitle>
              <CardDescription>为您的加密项目生成定制化的内容策划方案</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-title">策划标题</Label>
                  <Input
                    id="plan-title"
                    placeholder="输入策划标题"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-count">内容数量</Label>
                  <Select
                    value={formData.contentCount.toString()}
                    onValueChange={(value) => setFormData({ ...formData, contentCount: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5条</SelectItem>
                      <SelectItem value="10">10条</SelectItem>
                      <SelectItem value="20">20条</SelectItem>
                      <SelectItem value="30">30条</SelectItem>
                      <SelectItem value="50">50条</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-description">策划描述</Label>
                <Textarea
                  id="plan-description"
                  placeholder="描述此内容策划的目标和要点"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>目标平台</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {platformOptions.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform.value}`}
                        checked={formData.platforms.includes(platform.value)}
                        onCheckedChange={() => handlePlatformToggle(platform.value)}
                      />
                      <Label htmlFor={`platform-${platform.value}`} className="cursor-pointer">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>内容类型</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {contentTypeOptions.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={formData.contentTypes.includes(type.value)}
                        onCheckedChange={() => handleContentTypeToggle(type.value)}
                      />
                      <Label htmlFor={`type-${type.value}`} className="cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics">关键话题</Label>
                <Input
                  id="topics"
                  placeholder="输入关键话题，用逗号分隔"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">例如：空投, 代币经济, 安全, 新功能</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>语调风格</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData({ ...formData, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">专业正式</SelectItem>
                      <SelectItem value="casual">轻松随意</SelectItem>
                      <SelectItem value="enthusiastic">热情积极</SelectItem>
                      <SelectItem value="educational">教育科普</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>主要语言</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">英文</SelectItem>
                      <SelectItem value="chinese">中文</SelectItem>
                      <SelectItem value="bilingual">中英双语</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>AI生成选项</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-translation"
                      checked={formData.includeTranslation}
                      onCheckedChange={(checked) => setFormData({ ...formData, includeTranslation: !!checked })}
                    />
                    <Label htmlFor="include-translation" className="cursor-pointer">
                      包含中文翻译
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-image-prompt"
                      checked={formData.includeImagePrompt}
                      onCheckedChange={(checked) => setFormData({ ...formData, includeImagePrompt: !!checked })}
                    />
                    <Label htmlFor="include-image-prompt" className="cursor-pointer">
                      生成图片提示词
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGeneratePlan} 
                disabled={generating || !formData.title || !formData.description}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成内容策划方案
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>策划方案列表</CardTitle>
                  <CardDescription>已创建的内容策划方案</CardDescription>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">暂无策划方案</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          const element = document.querySelector('[data-value="create"]');
                          if (element instanceof HTMLElement) {
                            element.click();
                          }
                        }}
                      >
                        创建第一个策划方案
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {plans.map(plan => (
                          <div 
                            key={plan.id}
                            className={cn(
                              "p-3 rounded-md cursor-pointer hover:bg-muted",
                              activePlan?.id === plan.id && "bg-muted"
                            )}
                            onClick={() => setActivePlan(plan)}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{plan.title}</h4>
                              {activePlan?.id === plan.id && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {format(plan.startDate, "MM/dd")} - {format(plan.endDate, "MM/dd")}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                {plan.platforms.includes("twitter") && (
                                  <Twitter className="h-3 w-3 text-muted-foreground" />
                                )}
                                {plan.platforms.includes("telegram") && (
                                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {activePlan ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activePlan.title}</CardTitle>
                        <CardDescription>{activePlan.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        导出
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">
                        {format(activePlan.startDate, "yyyy/MM/dd")} - {format(activePlan.endDate, "yyyy/MM/dd")}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {activePlan.platforms.map(platform => (
                          <Badge key={platform} variant="secondary" className="capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="twitter" className="mt-2">
                      <TabsList className="mb-4">
                        {activePlan.platforms.includes("twitter") && (
                          <TabsTrigger value="twitter">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </TabsTrigger>
                        )}
                        {activePlan.platforms.includes("telegram") && (
                          <TabsTrigger value="telegram">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Telegram
                          </TabsTrigger>
                        )}
                      </TabsList>

                      {activePlan.platforms.includes("twitter") && (
                        <TabsContent value="twitter" className="space-y-4">
                          <div className="space-y-4">
                            {activePlan.generatedContent.map((content, index) => (
                              <div key={index} className="p-3 border rounded-md">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium">{content.englishContent}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(content.englishContent)}
                                      className="ml-2 flex-shrink-0"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  {content.chineseTranslation && (
                                    <div className="bg-gray-50 p-2 rounded text-sm">
                                      <p className="text-gray-600">{content.chineseTranslation}</p>
                                    </div>
                                  )}
                                  
                                  {content.imagePrompt && (
                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                      <p className="text-blue-600 text-xs">图片提示词: {content.imagePrompt}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {content.hashtags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {content.suggestedTime ? 
                                      format(new Date(content.suggestedTime), "MM/dd HH:mm") :
                                      format(
                                        new Date(
                                          activePlan.startDate.getTime() + 
                                          (index * (activePlan.endDate.getTime() - activePlan.startDate.getTime()) / 
                                          activePlan.generatedContent.length)
                                        ), 
                                        "MM/dd"
                                      )
                                    }
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {activePlan.contentTypes[index % activePlan.contentTypes.length]}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      )}

                      {activePlan.platforms.includes("telegram") && (
                        <TabsContent value="telegram" className="space-y-4">
                          <div className="space-y-4">
                            {activePlan.generatedContent.map((content, index) => (
                              <div key={index} className="p-3 border rounded-md">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium whitespace-pre-line">{content.englishContent}</p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(content.englishContent)}
                                      className="ml-2 flex-shrink-0"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  {content.chineseTranslation && (
                                    <div className="bg-gray-50 p-2 rounded text-sm">
                                      <p className="text-gray-600">{content.chineseTranslation}</p>
                                    </div>
                                  )}
                                  
                                  {content.imagePrompt && (
                                    <div className="bg-blue-50 p-2 rounded text-sm">
                                      <p className="text-blue-600 text-xs">图片提示词: {content.imagePrompt}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {content.hashtags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {content.suggestedTime ? 
                                      format(new Date(content.suggestedTime), "MM/dd HH:mm") :
                                      format(
                                        new Date(
                                          activePlan.startDate.getTime() + 
                                          (index * (activePlan.endDate.getTime() - activePlan.startDate.getTime()) / 
                                          activePlan.generatedContent.length)
                                        ), 
                                        "MM/dd"
                                      )
                                    }
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {activePlan.contentTypes[index % activePlan.contentTypes.length]}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">选择策划方案</h3>
                    <p className="text-muted-foreground">从左侧列表选择一个策划方案查看详情</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>内容日历</CardTitle>
              <CardDescription>查看和管理内容发布日程</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">内容日历功能开发中</h3>
                <p className="text-muted-foreground">此功能将在后续版本中提供</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 