"use client"

import type React from "react"

import { useState } from "react"
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
import { Upload, FileText, Download, CheckCircle, AlertCircle } from "lucide-react"

interface BatchUploadDialogProps {
  projectId: string
  type: "twitter" | "telegram"
  onUploadComplete?: (results: any[]) => void
}

export default function BatchUploadDialog({ projectId, type, onUploadComplete }: BatchUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleTextUpload = async () => {
    if (!textInput.trim()) return

    setUploading(true)
    try {
      const lines = textInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, 50) // 限制最多50条

      const posts = lines.map((content) => ({
        content,
        project_id: projectId,
        status: "draft",
        created_by: null,
      }))

      const endpoint = type === "twitter" ? "/api/twitter-posts" : "/api/telegram-posts"
      const uploadResults = []

      for (const post of posts) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
          })
          const result = await res.json()
          uploadResults.push({
            success: res.ok,
            content: post.content,
            error: res.ok ? null : result.error,
            data: res.ok ? result : null,
          })
        } catch (error) {
          uploadResults.push({
            success: false,
            content: post.content,
            error: error instanceof Error ? error.message : "上传失败",
            data: null,
          })
        }
      }

      setResults(uploadResults)
      onUploadComplete?.(uploadResults.filter((r) => r.success))
    } catch (error) {
      console.error("Batch upload error:", error)
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
        // 简单的CSV解析
        const lines = content.split("\n").slice(1) // 跳过标题行
        const texts = lines.map((line) => line.split(",")[0]?.replace(/"/g, "")).filter((text) => text?.trim())
        setTextInput(texts.join("\n"))
      } else {
        setTextInput(content)
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csvContent = `content,scheduled_time,target_likes,target_retweets
"示例推文内容1","2024-01-15 10:00:00",100,50
"示例推文内容2","2024-01-15 14:00:00",150,75`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
          <DialogDescription>支持文本输入或文件上传，最多50条内容</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="space-y-4">
          <TabsList>
            <TabsTrigger value="text">文本输入</TabsTrigger>
            <TabsTrigger value="file">文件上传</TabsTrigger>
            <TabsTrigger value="results">上传结果</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-content">内容（每行一条）</Label>
              <Textarea
                id="batch-content"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="每行输入一条内容，最多50条..."
                rows={15}
                className="font-mono text-sm"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>当前行数: {textInput.split("\n").filter((line) => line.trim()).length}/50</span>
                <span>字符数: {textInput.length}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleTextUpload} disabled={uploading || !textInput.trim()}>
                {uploading ? "上传中..." : "开始上传"}
              </Button>
              <Button variant="outline" onClick={() => setTextInput("")}>
                清空
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">上传CSV或TXT文件</p>
                <p className="text-sm text-muted-foreground mb-4">支持CSV、TXT格式，自动解析内容</p>
                <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="max-w-xs mx-auto" />
              </div>

              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  下载模板文件
                </Button>
              </div>

              {textInput && (
                <div className="space-y-2">
                  <Label>解析预览</Label>
                  <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{textInput}</pre>
                  </div>
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
