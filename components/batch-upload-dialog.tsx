"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Download, CheckCircle, AlertCircle, Table, Image as ImageIcon, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BatchUploadDialogProps {
  projectId: string
  type: "twitter" | "telegram"
  onUploadComplete?: (results: any[]) => void
}

interface TweetData {
  englishContent: string;
  chineseTranslation: string;
  tags: string[];
  imagePrompt: string;
  scheduledTime?: string;
  imageFile?: File;
  imagePreview?: string;
}

export default function BatchUploadDialog({ projectId, type, onUploadComplete }: BatchUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("text")
  const [parsedTweets, setParsedTweets] = useState<TweetData[]>([])
  
  // 解析输入的文本为结构化推文数据
  const parseTextToTweets = (text: string) => {
    if (!text.trim()) return []
    
    const lines = text.split('\n')
    const tweets: TweetData[] = []
    
    let currentTweet: Partial<TweetData> = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // 跳过空行
      
      // 使用前缀标记来识别内容类型
      if (line.startsWith('[EN]')) {
        // 如果已经有一条推文在处理中，先保存它
        if (currentTweet.englishContent) {
          tweets.push(currentTweet as TweetData)
          currentTweet = {}
        }
        currentTweet.englishContent = line.substring(4).trim()
      } 
      else if (line.startsWith('[CN]')) {
        currentTweet.chineseTranslation = line.substring(4).trim()
      }
      else if (line.startsWith('[TAGS]')) {
        const tagsText = line.substring(6).trim()
        currentTweet.tags = tagsText.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.trim())
      }
      else if (line.startsWith('[IMG]')) {
        currentTweet.imagePrompt = line.substring(5).trim()
      }
      else if (line.startsWith('[TIME]')) {
        // 新增：解析时间标签
        const timeText = line.substring(6).trim()
        currentTweet.scheduledTime = timeText
      }
      else if (line.startsWith('[END]')) {
        // 一条推文结束，添加到列表
        if (currentTweet.englishContent) {
          tweets.push({...currentTweet} as TweetData)
        }
        currentTweet = {}
      }
      // 兼容旧格式：如果没有前缀标记，尝试按行号解析
      else if (Object.keys(currentTweet).length === 0) {
        // 假设这是英文内容
        currentTweet.englishContent = line
      }
      else if (!currentTweet.chineseTranslation) {
        currentTweet.chineseTranslation = line
      }
      else if (!currentTweet.tags) {
        currentTweet.tags = line.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.trim())
      }
      else if (!currentTweet.imagePrompt) {
        currentTweet.imagePrompt = line
      }
    }
    
    // 处理最后一条推文（如果没有[END]结尾）
    if (currentTweet.englishContent && Object.keys(currentTweet).length > 0) {
      tweets.push(currentTweet as TweetData)
    }
    
    return tweets
  }
  
  // 处理文本输入变化
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setTextInput(text)
    
    // 自动解析文本为结构化推文
    const tweets = parseTextToTweets(text)
    setParsedTweets(tweets)
  }

  const handleTextUpload = async () => {
    if (parsedTweets.length === 0) return

    setUploading(true)
    try {
      const endpoint = type === "twitter" ? "/api/twitter-posts" : "/api/telegram-posts"
      const uploadResults = []

      for (const tweet of parsedTweets) {
        try {
          // 先上传图片（如果有）
          let imageId = null
          if (tweet.imageFile) {
            const formData = new FormData()
            formData.append('file', tweet.imageFile)
            formData.append('projectId', projectId)
            
            const imageRes = await fetch('/api/images', {
              method: 'POST',
              body: formData,
            })
            
            if (imageRes.ok) {
              const imageData = await imageRes.json()
              imageId = imageData.image?.id
            }
          }
          
          // 构建推文内容（包含英文内容）
          let content = tweet.englishContent
          
          // 如果有计划时间，添加到内容中
          if (tweet.scheduledTime) {
            content = `[time]${tweet.scheduledTime}\n${content}`
          }
          
          // 提取标签
          const tags = tweet.tags || []
          
          // 构建meta数据
          const meta = {
            english_content: tweet.englishContent,
            chinese_translation: tweet.chineseTranslation || '',
            image_prompt: tweet.imagePrompt || ''
          }
          
          // 确定状态和计划时间
          let status = "draft"
          let scheduledFor = null
          
          if (tweet.scheduledTime) {
            try {
              // 尝试解析时间字符串
              const scheduledDate = new Date(tweet.scheduledTime)
              if (!isNaN(scheduledDate.getTime())) {
                status = "scheduled"
                scheduledFor = scheduledDate.toISOString()
              }
            } catch (error) {
              console.warn("Invalid date format:", tweet.scheduledTime)
            }
          }
          
          const post = {
            content,
            project_id: projectId,
            status,
            created_by: null,
            meta,
            tags,
            images: imageId ? [imageId] : [],
            scheduled_for: scheduledFor
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
          })
          const result = await res.json()
          uploadResults.push({
            success: res.ok,
            content: tweet.englishContent,
            error: res.ok ? null : result.error,
            data: res.ok ? result : null,
          })
        } catch (error) {
          uploadResults.push({
            success: false,
            content: tweet.englishContent,
            error: error instanceof Error ? error.message : "上传失败",
            data: null,
          })
        }
      }

      setResults(uploadResults)
      onUploadComplete?.(uploadResults.filter((r) => r.success))
      
      // 上传成功后切换到结果标签
      setActiveTab("results")
    } catch (error: any) {
      console.error("Batch upload error:", error)
      const fetchError = error instanceof Error ? error.message : "批量上传失败";
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (file.name.endsWith(".csv")) {
        // CSV解析为结构化数据
        const lines = content.split("\n")
        const header = lines[0].split(",")
        
        // 检查CSV格式是否符合要求
        const hasRequiredColumns = 
          header.includes("english_content") && 
          header.includes("chinese_translation")
        
        if (hasRequiredColumns) {
          const englishIndex = header.indexOf("english_content")
          const chineseIndex = header.indexOf("chinese_translation")
          const tagsIndex = header.indexOf("tags")
          const imagePromptIndex = header.indexOf("image_prompt")
          const timeIndex = header.indexOf("scheduled_time") // 新增：时间列
          
          const dataLines = lines.slice(1)
          let formattedText = ""
          
          dataLines.forEach(line => {
            if (!line.trim()) return
            
            const columns = line.split(",").map(col => col.replace(/^"|"$/g, "").trim())
            
            const englishContent = englishIndex >= 0 ? columns[englishIndex] : ""
            const chineseTranslation = chineseIndex >= 0 ? columns[chineseIndex] : ""
            const tags = tagsIndex >= 0 ? columns[tagsIndex] : ""
            const imagePrompt = imagePromptIndex >= 0 ? columns[imagePromptIndex] : ""
            const scheduledTime = timeIndex >= 0 ? columns[timeIndex] : "" // 新增：时间
            
            let tweetText = `[EN] ${englishContent}\n[CN] ${chineseTranslation}\n[TAGS] ${tags}\n[IMG] ${imagePrompt}`
            
            // 如果有时间，添加时间标签
            if (scheduledTime) {
              tweetText += `\n[TIME] ${scheduledTime}`
            }
            
            tweetText += `\n[END]\n\n`
            formattedText += tweetText
          })
          
          setTextInput(formattedText)
          setParsedTweets(parseTextToTweets(formattedText))
        } else {
          // 简单CSV解析（兼容旧格式）
          const texts = lines.slice(1).map(line => line.split(",")[0]?.replace(/"/g, "")).filter(text => text?.trim())
          const formattedText = texts.map(text => `[EN] ${text}\n[END]\n`).join("\n")
          setTextInput(formattedText)
          setParsedTweets(parseTextToTweets(formattedText))
        }
      } else {
        // 普通文本解析
        setTextInput(content)
        setParsedTweets(parseTextToTweets(content))
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csvContent = `english_content,chinese_translation,tags,image_prompt,scheduled_time
"This is our new product launch!","这是我们的新产品发布！","#crypto #blockchain #newlaunch","A modern sleek product on display","2024-01-15T10:00:00Z"
"Join our AMA session tomorrow","明天加入我们的AMA会话","#AMA #community #crypto","A group of people in a virtual meeting","2024-01-16T15:00:00Z"`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  // 为特定推文上传图片
  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)
    
    // 更新推文数据
    setParsedTweets(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: previewUrl
      }
      return updated
    })
  }
  
  // 移除特定推文的图片
  const handleRemoveImage = (index: number) => {
    setParsedTweets(prev => {
      const updated = [...prev]
      if (updated[index].imagePreview) {
        URL.revokeObjectURL(updated[index].imagePreview!)
      }
      updated[index] = {
        ...updated[index],
        imageFile: undefined,
        imagePreview: undefined
      }
      return updated
    })
  }

  // 格式化时间显示
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        return timeString // 如果不是有效日期，直接返回原字符串
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timeString
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          批量上传
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量上传{type === "twitter" ? "推文" : "Telegram帖子"}</DialogTitle>
          <DialogDescription>支持结构化批量上传，包含英文、中文、标签、图片提示词、计划时间和图片</DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">上传格式说明 - 使用标记前缀</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>每条推文使用以下标记前缀</strong>，顺序不限：</p>
            <ul className="list-disc list-inside ml-2">
              <li><code className="bg-blue-100 px-1 rounded">[EN]</code> 英文推文正文</li>
              <li><code className="bg-blue-100 px-1 rounded">[CN]</code> 中文对照翻译</li>
              <li><code className="bg-blue-100 px-1 rounded">[TAGS]</code> 标签（以#开头，空格分隔）</li>
              <li><code className="bg-blue-100 px-1 rounded">[IMG]</code> 图片提示词</li>
              <li><code className="bg-blue-100 px-1 rounded">[TIME]</code> 计划发布时间（ISO格式：2024-01-15T10:00:00Z）</li>
              <li><code className="bg-blue-100 px-1 rounded">[END]</code> 推文结束标记</li>
            </ul>
            <p className="mt-2">每条推文必须以 <code className="bg-blue-100 px-1 rounded">[EN]</code> 开头，以 <code className="bg-blue-100 px-1 rounded">[END]</code> 结尾。</p>
            <p>也可以使用CSV文件，系统会自动转换为标记格式。</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="text">文本输入</TabsTrigger>
            <TabsTrigger value="structured">结构化编辑</TabsTrigger>
            <TabsTrigger value="file">文件上传</TabsTrigger>
            <TabsTrigger value="results">上传结果</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-content">使用标记前缀的结构化内容</Label>
              <div className="text-xs text-muted-foreground mb-2 p-2 border rounded-md bg-gray-50">
                <p className="font-medium mb-1">格式示例：</p>
                <pre className="text-xs whitespace-pre-wrap">
{`[EN] We are excited to announce our new feature!
[CN] 我们很高兴宣布我们的新功能！
[TAGS] #crypto #blockchain #newfeature
[IMG] A modern interface with glowing elements
[TIME] 2024-01-15T10:00:00Z
[END]

[EN] Join our AMA session tomorrow at 3PM UTC
[CN] 明天UTC时间下午3点加入我们的AMA会话
[TAGS] #AMA #community
[IMG] People in a virtual meeting room
[TIME] 2024-01-16T15:00:00Z
[END]`}
                </pre>
              </div>
              <Textarea
                id="batch-content"
                value={textInput}
                onChange={handleTextInputChange}
                placeholder="[EN] 英文内容
[CN] 中文对照
[TAGS] #标签1 #标签2
[IMG] 图片提示词
[TIME] 2024-01-15T10:00:00Z
[END]

[EN] 下一条推文英文内容
[CN] 下一条推文中文对照
[TAGS] #标签1 #标签2
[IMG] 图片提示词
[TIME] 2024-01-16T15:00:00Z
[END]"
                rows={15}
                className="font-mono text-sm"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>已解析推文数: {parsedTweets.length}</span>
                <span>字符数: {textInput.length}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setActiveTab("structured")} disabled={parsedTweets.length === 0}>
                查看解析结果
              </Button>
              <Button variant="outline" onClick={() => {
                setTextInput("")
                setParsedTweets([])
              }}>
                清空
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="structured" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">已解析 {parsedTweets.length} 条推文</h3>
                <Button onClick={handleTextUpload} disabled={uploading || parsedTweets.length === 0}>
                  {uploading ? "上传中..." : "开始上传"}
                </Button>
              </div>
               
              <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-2">
                <h4 className="font-medium text-green-800 mb-1">操作指南</h4>
                <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                  <li>检查每条推文的内容是否正确</li>
                  <li>点击"上传图片"按钮为推文添加配图</li>
                  <li>所有内容确认无误后，点击右上角"开始上传"按钮</li>
                  <li>上传完成后可在"上传结果"标签页查看结果</li>
                </ul>
              </div>
              
              <ScrollArea className="h-[500px] border rounded-md p-4">
                <div className="space-y-8">
                  {parsedTweets.map((tweet, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">推文 #{index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge>{tweet.tags?.length || 0} 个标签</Badge>
                          {tweet.scheduledTime && (
                            <Badge variant="outline" className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(tweet.scheduledTime)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">英文内容</Label>
                          <div className="bg-gray-50 p-2 rounded text-sm">{tweet.englishContent}</div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">中文对照</Label>
                          <div className="bg-gray-50 p-2 rounded text-sm">{tweet.chineseTranslation || "无"}</div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">标签</Label>
                          <div className="flex flex-wrap gap-1">
                            {tweet.tags && tweet.tags.length > 0 ? 
                              tweet.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                              )) : 
                              <span className="text-sm text-muted-foreground">无标签</span>
                            }
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">图片提示词</Label>
                          <div className="bg-gray-50 p-2 rounded text-sm">{tweet.imagePrompt || "无"}</div>
                        </div>
                        
                        {tweet.scheduledTime && (
                          <div>
                            <Label className="text-xs text-muted-foreground">计划发布时间</Label>
                            <div className="bg-blue-50 p-2 rounded text-sm flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-blue-500" />
                              {formatTime(tweet.scheduledTime)}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">图片</Label>
                          {tweet.imagePreview ? (
                            <div className="relative w-32 h-32 mt-1">
                              <img 
                                src={tweet.imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 mt-1">
                              <label htmlFor={`image-upload-${index}`} className="cursor-pointer">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  type="button"
                                  className="h-8"
                                >
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  上传图片
                                </Button>
                                <input
                                  id={`image-upload-${index}`}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(index, e)}
                                />
                              </label>
                              {tweet.imagePrompt && (
                                <span className="text-xs text-muted-foreground">
                                  已设置提示词，但未上传图片
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">上传CSV或TXT文件</p>
                <p className="text-sm text-muted-foreground mb-4">支持结构化CSV格式，自动解析内容</p>
                <div className="bg-gray-50 p-3 rounded-md text-xs text-left mb-4 mx-auto max-w-md">
                  <p className="font-medium mb-1">CSV文件格式要求：</p>
                  <p>必须包含以下列：</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>english_content - 英文推文内容</li>
                    <li>chinese_translation - 中文对照翻译</li>
                    <li>tags - 标签，以#开头，空格分隔</li>
                    <li>image_prompt - 图片提示词</li>
                    <li>scheduled_time - 计划发布时间（ISO格式）</li>
                  </ul>
                </div>
                <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="max-w-xs mx-auto" />
              </div>

              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  下载模板文件
                </Button>
              </div>

              {parsedTweets.length > 0 && (
                <div className="flex justify-center mt-4">
                  <Button onClick={() => setActiveTab("structured")}>
                    查看解析结果 ({parsedTweets.length} 条推文)
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无上传结果</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">上传结果</h4>
                  <div className="flex space-x-2">
                    <Badge variant="default">成功: {results.filter((r) => r.success).length}</Badge>
                    <Badge variant="destructive">失败: {results.filter((r) => !r.success).length}</Badge>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{result.content}</p>
                          {result.error && <p className="text-xs text-red-600 mt-1">{result.error}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
