"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    logo_url: "",
    token_symbol: "",
    token_contract: "",
    launch_date: "",
    total_supply: "",
    market_cap: "",
  })

  const handleChange = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [key]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 处理数值字段
      const processedData = {
        ...formData,
        total_supply: formData.total_supply ? parseFloat(formData.total_supply) : null,
        market_cap: formData.market_cap ? parseFloat(formData.market_cap) : null,
        launch_date: formData.launch_date || null,
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
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
        logo_url: "",
        token_symbol: "",
        token_contract: "",
        launch_date: "",
        total_supply: "",
        market_cap: "",
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
              <Label htmlFor="token_symbol">代币符号</Label>
              <Input
                id="token_symbol"
                value={formData.token_symbol}
                onChange={handleChange("token_symbol")}
                placeholder="例如：BTC, ETH"
              />
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

          {/* 项目详情 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={handleChange("logo_url")}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token_contract">合约地址</Label>
              <Input
                id="token_contract"
                value={formData.token_contract}
                onChange={handleChange("token_contract")}
                placeholder="0x..."
              />
            </div>
          </div>

          {/* 项目数据 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="launch_date">发布日期</Label>
              <Input
                id="launch_date"
                type="date"
                value={formData.launch_date}
                onChange={handleChange("launch_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_supply">总供应量</Label>
              <Input
                id="total_supply"
                type="number"
                value={formData.total_supply}
                onChange={handleChange("total_supply")}
                placeholder="1000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market_cap">市值 (USD)</Label>
              <Input
                id="market_cap"
                type="number"
                value={formData.market_cap}
                onChange={handleChange("market_cap")}
                placeholder="500000"
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
