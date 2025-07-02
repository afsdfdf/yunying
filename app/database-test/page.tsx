"use client"

import DatabaseStatus from "@/components/database-status"

export default function DatabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据库连接测试</h1>
          <p className="text-gray-600">检查系统与 Supabase 数据库的连接状态</p>
        </div>

        <DatabaseStatus />
      </div>
    </div>
  )
}
