import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 测试基本连接 - 尝试创建一个测试表
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: 'CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, test_column TEXT);' 
    })

    if (error) {
      console.error("Supabase connection error:", error)
      return NextResponse.json(
        {
          error: "连接失败",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase 连接成功",
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json(
      {
        error: "连接测试失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
