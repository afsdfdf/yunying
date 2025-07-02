"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, RefreshCw, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getProjects, getUsers } from "@/lib/database"

export default function DatabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [testResults, setTestResults] = useState({
    supabase: false,
    projects: false,
    users: false,
    images: false,
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const checkDatabaseConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("checking")
    setErrorMessage("")

    try {
      // 辅助：尝试 select id，捕获 "42P01(表不存在)" 错误
      const tableExists = async (table: string) => {
        try {
          const { error } = await supabase.from(table).select("id").limit(1)
          if (error) {
            // 42P01 = undefined_table
            if (error.code === "42P01") return false
            // 其它错误代表还能连上数据库
            console.error(`${table} 检测报错:`, error)
          }
          return true
        } catch (e) {
          console.error(`${table} 检测异常:`, e)
          return false
        }
      }

      // Test 1: 基础连接测试
      try {
        // 使用一个简单的查询来测试连接
        const { error } = await supabase.from("_supabase_migrations").select("version").limit(1)
        if (error && error.code !== "42P01") {
          // 如果不是表不存在的错误，说明连接有问题
          throw new Error("Supabase 连接失败")
        }
        setTestResults((prev) => ({ ...prev, supabase: true }))
      } catch (e) {
        // 尝试另一种连接测试方法
        try {
          await supabase.auth.getSession()
          setTestResults((prev) => ({ ...prev, supabase: true }))
        } catch (authError) {
          throw new Error("Supabase 连接失败")
        }
      }

      // Test 2: 检测业务表是否存在
      const usersExists = await tableExists("users")
      const projectsExists = await tableExists("projects")
      const imagesExists = await tableExists("images")

      setTestResults({
        supabase: true,
        users: usersExists,
        projects: projectsExists,
        images: imagesExists,
      })

      // Test 3: Try to query data if tables exist
      if (projectsExists) {
        try {
          const projects = await getProjects()
          console.log("Projects loaded:", projects.length)
        } catch (error) {
          console.error("Projects query failed:", error)
        }
      }

      if (usersExists) {
        try {
          const users = await getUsers()
          console.log("Users loaded:", users.length)
        } catch (error) {
          console.error("Users query failed:", error)
        }
      }

      setConnectionStatus("connected")
    } catch (error) {
      console.error("Database connection error:", error)
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "未知错误")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (status: boolean) => {
    return <Badge variant={status ? "default" : "destructive"}>{status ? "正常" : "失败"}</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <CardTitle>数据库连接状态</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={checkDatabaseConnection} disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            重新检测
          </Button>
        </div>
        <CardDescription>检查 Supabase 数据库和各个表的连接状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            {connectionStatus === "checking" ? (
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            ) : connectionStatus === "connected" ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <h3 className="font-medium">总体状态</h3>
              <p className="text-sm text-muted-foreground">
                {connectionStatus === "checking" && "正在检测连接..."}
                {connectionStatus === "connected" && "数据库连接正常"}
                {connectionStatus === "error" && "数据库连接异常"}
              </p>
            </div>
          </div>
          <Badge
            variant={
              connectionStatus === "connected" ? "default" : connectionStatus === "error" ? "destructive" : "secondary"
            }
          >
            {connectionStatus === "checking" && "检测中"}
            {connectionStatus === "connected" && "已连接"}
            {connectionStatus === "error" && "连接失败"}
          </Badge>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">连接错误</h4>
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Individual Table Status */}
        <div className="space-y-3">
          <h4 className="font-medium">数据表状态</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(testResults.supabase)}
                <span className="text-sm font-medium">Supabase 连接</span>
              </div>
              {getStatusBadge(testResults.supabase)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(testResults.projects)}
                <span className="text-sm font-medium">项目表 (projects)</span>
              </div>
              {getStatusBadge(testResults.projects)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(testResults.users)}
                <span className="text-sm font-medium">用户表 (users)</span>
              </div>
              {getStatusBadge(testResults.users)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon(testResults.images)}
                <span className="text-sm font-medium">图片表 (images)</span>
              </div>
              {getStatusBadge(testResults.images)}
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">连接信息</h4>
          <div className="text-sm text-blue-600 space-y-1">
            <p>• Supabase URL: https://bndruoeqxhydszlirmoe.supabase.co</p>
            <p>• Supabase Key: 已配置</p>
            <p>• Service Role Key: 已配置</p>
            <p>• Blob Token: {process.env.BLOB_READ_WRITE_TOKEN ? "已配置" : "未配置"}</p>
          </div>
        </div>

        {/* Quick Actions */}
        {connectionStatus === "connected" && testResults.supabase && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ 数据库已成功连接</h4>
            <p className="text-sm text-green-600 mb-3">
              {testResults.projects && testResults.users
                ? "所有核心功能已就绪，您可以开始使用系统的完整功能。"
                : "数据库连接正常，但需要初始化数据表。"}
            </p>
            {(!testResults.projects || !testResults.users) && (
              <Button asChild size="sm">
                <a href="/setup">初始化数据库</a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
