"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Shield, Eye } from "lucide-react"

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "张三",
      email: "zhangsan@example.com",
      role: "管理员",
      status: "active",
      lastLogin: "2024-01-10 14:30",
      projects: ["project-1", "project-2", "project-3"],
    },
    {
      id: 2,
      name: "李四",
      email: "lisi@example.com",
      role: "运营人员",
      status: "active",
      lastLogin: "2024-01-10 12:15",
      projects: ["project-1", "project-2"],
    },
    {
      id: 3,
      name: "王五",
      email: "wangwu@example.com",
      role: "数据分析师",
      status: "inactive",
      lastLogin: "2024-01-08 16:45",
      projects: ["project-1"],
    },
  ])

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "管理员",
      description: "拥有所有权限，可以管理用户和系统设置",
      permissions: ["项目创建", "用户管理", "数据导出", "系统设置", "推文发布", "数据查看"],
    },
    {
      id: 2,
      name: "运营人员",
      description: "负责日常运营工作，可以发布内容和查看数据",
      permissions: ["推文发布", "电报管理", "数据查看", "项目管理"],
    },
    {
      id: 3,
      name: "数据分析师",
      description: "专注于数据分析，只能查看和导出数据",
      permissions: ["数据查看", "数据导出"],
    },
  ])

  const allPermissions = [
    "项目创建",
    "项目管理",
    "用户管理",
    "推文发布",
    "电报管理",
    "数据查看",
    "数据导出",
    "系统设置",
    "权限管理",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新用户</DialogTitle>
              <DialogDescription>创建新的用户账号并分配权限</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" placeholder="输入用户姓名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" placeholder="输入邮箱地址" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择用户角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="operator">运营人员</SelectItem>
                    <SelectItem value="analyst">数据分析师</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">取消</Button>
                <Button>创建用户</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">用户列表</TabsTrigger>
          <TabsTrigger value="roles">角色权限</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理系统用户账号和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder-user.jpg`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={user.role === "管理员" ? "default" : "secondary"}>{user.role}</Badge>
                          <Badge variant={user.status === "active" ? "default" : "outline"}>
                            {user.status === "active" ? "活跃" : "非活跃"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">最后登录: {user.lastLogin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>角色权限管理</CardTitle>
              <CardDescription>配置不同角色的系统权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          {role.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        编辑
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allPermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${role.id}-${permission}`}
                            checked={role.permissions.includes(permission)}
                            readOnly
                          />
                          <label htmlFor={`${role.id}-${permission}`} className="text-sm">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>查看用户操作记录和系统日志</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "张三", action: "创建了新项目", time: "2024-01-10 15:30", type: "create" },
                  { user: "李四", action: "发布了推文", time: "2024-01-10 14:15", type: "publish" },
                  { user: "王五", action: "导出了数据报告", time: "2024-01-10 13:45", type: "export" },
                  { user: "张三", action: "修改了用户权限", time: "2024-01-10 12:30", type: "modify" },
                  { user: "李四", action: "登录系统", time: "2024-01-10 09:15", type: "login" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.type === "create"
                            ? "bg-green-500"
                            : log.type === "publish"
                              ? "bg-blue-500"
                              : log.type === "export"
                                ? "bg-purple-500"
                                : log.type === "modify"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium">
                          {log.user} {log.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.type === "create"
                        ? "创建"
                        : log.type === "publish"
                          ? "发布"
                          : log.type === "export"
                            ? "导出"
                            : log.type === "modify"
                              ? "修改"
                              : "登录"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
