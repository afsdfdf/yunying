import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()
    const requiredTables = ["users", "projects"]
    const allTables = ["users", "projects", "tasks", "images", "twitter_posts", 
                      "telegram_posts", "website_analytics", "activity_logs"]
    
    // 存储所有表的存在状态
    const tableStatus: Record<string, boolean> = {}
    const missingRequiredTables: string[] = []

    // 检查每个表是否存在
    for (const tableName of allTables) {
      const { data: tableExists, error: tableError } = await supabaseAdmin.rpc('exec_sql', { 
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );` 
      })

      if (tableError) {
        console.error(`检查表 ${tableName} 失败:`, tableError)
        return NextResponse.json({ error: "表结构验证失败", details: tableError.message }, { status: 500 })
      }

      const exists = tableExists && tableExists.includes('t')
      tableStatus[tableName] = exists

      // 如果是必需表且不存在，添加到缺失列表
      if (requiredTables.includes(tableName) && !exists) {
        missingRequiredTables.push(tableName)
      }
    }

    if (missingRequiredTables.length > 0) {
      return NextResponse.json(
        {
          error: "缺少必要的数据表",
          details: `缺少表: ${missingRequiredTables.join(", ")}`,
        },
        { status: 500 },
      )
    }

    // 测试数据查询 - 使用SQL直接查询避免schema缓存问题
    const { data: usersResult, error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `SELECT COUNT(*) FROM users;`
    })

    if (usersError) {
      return NextResponse.json({ error: "用户数据查询失败", details: usersError.message }, { status: 500 })
    }

    // 解析用户数量
    let usersCount = 0
    try {
      const countMatch = usersResult && usersResult.match(/\d+/)
      usersCount = countMatch ? parseInt(countMatch[0], 10) : 0
    } catch (e) {
      console.error("Error parsing users count:", e)
    }

    // 查询项目数据
    const { data: projectsResult, error: projectsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `SELECT COUNT(*) FROM projects;`
    })

    if (projectsError) {
      return NextResponse.json({ error: "项目数据查询失败", details: projectsError.message }, { status: 500 })
    }

    // 解析项目数量
    let projectsCount = 0
    try {
      const countMatch = projectsResult && projectsResult.match(/\d+/)
      projectsCount = countMatch ? parseInt(countMatch[0], 10) : 0
    } catch (e) {
      console.error("Error parsing projects count:", e)
    }

    // 计算已创建的表数量
    const tablesCreated = Object.values(tableStatus).filter(Boolean).length
    const tablesList = Object.keys(tableStatus).filter(tableName => tableStatus[tableName])

    return NextResponse.json({
      success: true,
      message: "系统配置验证成功",
      data: {
        tables_created: tablesCreated,
        tables_list: tablesList,
        tables_status: tableStatus,
        users_count: usersCount,
        projects_count: projectsCount,
      },
    })
  } catch (error) {
    console.error("Verification failed:", error)
    return NextResponse.json(
      {
        error: "配置验证失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
