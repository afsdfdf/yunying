"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CreateProjectDialogProps {
  onProjectCreated?: (project: any) => void
}

export default function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    website_url: "",
    twitter_handle: "",
    telegram_handle: "",
  })

  const handleChange = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.details || result.error || "创建项目失败")
      }

      // Notify parent & reset
      onProjectCreated?.(result.project)
      setFormData({
        name: "",
        description: "",
        status: "planning",
        website_url: "",
        twitter_handle: "",
        telegram_handle: "",
      })
      setOpen(false)
      // Optional: refresh or mutate SWR/React-Query cache instead
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建项目失败")
      console.error("Create project error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          新建项目
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>创建新项目</DialogTitle>
          <DialogDescription>填写项目信息来创建一个新的加密项目。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">项目名称 *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="输入项目名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">项目状态</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">规划中</SelectItem>
                  <SelectItem value="development">开发中</SelectItem>
                  <SelectItem value="testing">测试中</SelectItem>
                  <SelectItem value="active">已上线</SelectItem>
                  <SelectItem value="maintenance">维护中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">项目描述</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="详细描述项目的目标和特点"
            />
          </div>

          {/* 外部链接 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="website">官方网站</Label>
              <Input
                id="website"
                type="url"
                value={formData.website_url}
                onChange={handleChange("website_url")}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter 账号</Label>
              <Input
                id="twitter"
                value={formData.twitter_handle}
                onChange={handleChange("twitter_handle")}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram 群组</Label>
              <Input
                id="telegram"
                value={formData.telegram_handle}
                onChange={handleChange("telegram_handle")}
                placeholder="@groupname"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建项目
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
