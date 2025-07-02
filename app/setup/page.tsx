"use client"

import SupabaseSetup from "@/components/supabase-setup"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">系统初始化</h1>
          <p className="text-gray-600">自动配置 Supabase 数据库和系统设置</p>
        </div>

        <SupabaseSetup />
      </div>
    </div>
  )
}
