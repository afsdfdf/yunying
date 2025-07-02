import { NextResponse } from "next/server"
import { supabase, createAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const results = {
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
    }

    // 测试基本连接
    try {
      const { data, error } = await supabase.auth.getSession()
      if (!error) {
        results.connection = true
      }
    } catch (error) {
      results.errors.push(`连接测试失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }

    // 检查表是否存在
    const supabaseAdmin = createAdminClient()

    const tableNames = ["users", "projects", "tasks", "twitter_posts", "telegram_posts"]

    for (const tableName of tableNames) {
      try {
        const { error } = await supabaseAdmin.from(tableName).select("id").limit(1)
        if (!error || error.code !== "42P01") {
          results.tables[tableName] = true
        }
      } catch (error) {
        results.errors.push(`表 ${tableName} 检查失败: ${error instanceof Error ? error.message : "未知错误"}`)
      }
    }

    // 获取数据统计
    if (results.tables.users) {
      try {
        const { count } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true })
        results.data.users_count = count || 0
      } catch (error) {
        results.errors.push(`用户数据统计失败: ${error instanceof Error ? error.message : "未知错误"}`)
      }
    }

    if (results.tables.projects) {
      try {
        const { count } = await supabaseAdmin.from("projects").select("*", { count: "exact", head: true })
        results.data.projects_count = count || 0
      } catch (error) {
        results.errors.push(`项目数据统计失败: ${error instanceof Error ? error.message : "未知错误"}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Database status check failed:", error)
    return NextResponse.json(
      {
        error: "数据库状态检查失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
