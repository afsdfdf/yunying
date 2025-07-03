"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ProjectSettings from "@/components/project-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, FolderOpen, Users, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId)

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId)
    }
  }, [projectId])

  const handleProjectDeleted = () => {
    // 项目删除后，重定向到主页
    router.push("/")
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">设置</h1>
              <p className="text-gray-600">管理系统配置和项目设置</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/")}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2" />
                  项目管理
                </CardTitle>
                <CardDescription>管理项目信息和配置</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  请先选择一个项目，然后进入项目设置页面进行管理。
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  用户管理
                </CardTitle>
                <CardDescription>管理用户和权限</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  用户管理功能正在开发中...
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  安全设置
                </CardTitle>
                <CardDescription>管理安全配置</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  安全设置功能正在开发中...
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  数据库管理
                </CardTitle>
                <CardDescription>管理数据库连接和状态</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  数据库管理功能正在开发中...
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  系统设置
                </CardTitle>
                <CardDescription>管理系统配置</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  系统设置功能正在开发中...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目设置</h1>
            <p className="text-gray-600">管理项目信息和配置</p>
          </div>
        </div>

        <ProjectSettings 
          projectId={selectedProject} 
          onProjectDeleted={handleProjectDeleted}
        />
      </div>
    </div>
  )
} 