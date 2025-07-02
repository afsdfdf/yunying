"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from "lucide-react"

export default function DatabaseConnectionStatus() {
  const [status, setStatus] = useState({
    connection: false,
    tables: {
      users: false,
      projects: false,
      tasks: false,
      twitter_posts: false,
      telegram_posts: false,
    },
    data: {
      users_count: 0,
      projects_count: 0,
    },
    errors: [] as string[],
    loading: true,
  })

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }))

    try {
      const response = await fetch("/api/database/status")
      const result = await response.json()

      if (response.ok) {
        setStatus({ ...result, loading: false })
      } else {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          errors: [result.details || result.error || "检查失败"],
        }))
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        errors: [error instanceof Error ? error.message : "网络错误"],
      }))
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (isOk: boolean) => {
    return isOk ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = (isOk: boolean) => {
    return <Badge variant={isOk ? "default" : "destructive"}>{isOk ? "正常" : "异常"}</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <CardTitle className="text-base">数据库状态</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={status.loading}>
            {status.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
        <CardDescription>实时数据库连接和表状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 连接状态 */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.connection)}
            <span className="text-sm font-medium">数据库连接</span>
          </div>
          {getStatusBadge(status.connection)}
        </div>

        {/* 表状态 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">数据表状态</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(status.tables).map(([table, isOk]) => (
              <div key={table} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(isOk)}
                  <span>{table}</span>
                </div>
                {getStatusBadge(isOk)}
              </div>
            ))}
          </div>
        </div>

        {/* 数据统计 */}
        {(status.data.users_count > 0 || status.data.projects_count > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">数据统计</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>用户数量:</span>
                <span className="font-medium">{status.data.users_count}</span>
              </div>
              <div className="flex justify-between">
                <span>项目数量:</span>
                <span className="font-medium">{status.data.projects_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {status.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">错误信息</h4>
            <div className="space-y-1">
              {status.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded text-sm"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-red-600">{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作建议 */}
        {!status.connection && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">数据库连接失败，请检查：</p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
              <li>Supabase 服务是否正常运行</li>
              <li>环境变量配置是否正确</li>
              <li>网络连接是否正常</li>
            </ul>
          </div>
        )}

        {status.connection && !status.tables.projects && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">数据库已连接，但缺少必要的表。</p>
            <Button asChild size="sm" className="mt-2">
              <a href="/setup">初始化数据库</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
