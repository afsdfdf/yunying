"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Database, AlertCircle, Loader2 } from "lucide-react"

interface SetupStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  error?: string
}

export default function SupabaseSetup() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "connection",
      name: "连接 Supabase",
      description: "建立与 Supabase 数据库的连接",
      status: "pending",
    },
    {
      id: "tables",
      name: "创建数据表",
      description: "创建系统所需的所有数据表",
      status: "pending",
    },
    {
      id: "seed",
      name: "初始化数据",
      description: "插入示例数据和默认配置",
      status: "pending",
    },
    {
      id: "verification",
      name: "验证配置",
      description: "验证所有功能是否正常工作",
      status: "pending",
    },
  ])

  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const updateStepStatus = (stepId: string, status: SetupStep["status"], error?: string) => {
    setSetupSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, error } : step)))
  }

  const runSetup = async () => {
    setIsSetupRunning(true)
    setSetupProgress(0)
    setCurrentStep(0)

    try {
      // Step 1: Test Supabase Connection
      setCurrentStep(1)
      updateStepStatus("connection", "running")
      setSetupProgress(25)

      const connectionResult = await fetch("/api/setup/connection", {
        method: "POST",
      })

      const connectionData = await connectionResult.json()

      if (!connectionResult.ok) {
        throw new Error(connectionData.details || "Supabase 连接失败")
      }

      updateStepStatus("connection", "completed")

      // Step 2: Create Tables
      setCurrentStep(2)
      updateStepStatus("tables", "running")
      setSetupProgress(50)

      const tablesResult = await fetch("/api/setup/tables", {
        method: "POST",
      })

      const tablesData = await tablesResult.json()

      if (!tablesResult.ok) {
        throw new Error(tablesData.details || "数据表创建失败")
      }

      updateStepStatus("tables", "completed")

      // Step 3: Seed Data
      setCurrentStep(3)
      updateStepStatus("seed", "running")
      setSetupProgress(75)

      const seedResult = await fetch("/api/setup/seed", {
        method: "POST",
      })

      const seedData = await seedResult.json()

      if (!seedResult.ok) {
        throw new Error(seedData.details || "数据初始化失败")
      }

      updateStepStatus("seed", "completed")

      // Step 4: Verification
      setCurrentStep(4)
      updateStepStatus("verification", "running")
      setSetupProgress(100)

      const verificationResult = await fetch("/api/setup/verify", {
        method: "POST",
      })

      const verificationData = await verificationResult.json()

      if (!verificationResult.ok) {
        throw new Error(verificationData.details || "配置验证失败")
      }

      updateStepStatus("verification", "completed")

      // All steps completed
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误"
      const currentStepId = setupSteps[currentStep - 1]?.id || "connection"
      updateStepStatus(currentStepId, "error", errorMessage)
    } finally {
      setIsSetupRunning(false)
    }
  }

  const getStepIcon = (step: SetupStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepBadge = (step: SetupStep) => {
    switch (step.status) {
      case "completed":
        return <Badge variant="default">完成</Badge>
      case "running":
        return <Badge variant="secondary">进行中</Badge>
      case "error":
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="outline">等待</Badge>
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <CardTitle>Supabase 自动配置</CardTitle>
          </div>
          <CardDescription>自动设置数据库连接和初始化系统数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>配置进度</span>
              <span>{setupProgress}%</span>
            </div>
            <Progress value={setupProgress} className="w-full" />
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            {setupSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    {getStepBadge(step)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  {step.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{step.error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={runSetup} disabled={isSetupRunning} size="lg">
              {isSetupRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  配置中...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  开始自动配置
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">配置说明</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• 系统将自动创建所有必要的数据表</li>
              <li>• 插入示例项目和用户数据</li>
              <li>• 配置完成后将自动跳转到主页面</li>
              <li>• 整个过程大约需要 30-60 秒</li>
            </ul>
          </div>

          {/* Environment Check */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">环境检查</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "已配置" : "未配置"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Key:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已配置" : "未配置"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
