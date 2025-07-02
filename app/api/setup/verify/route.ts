import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 检查表是否存在
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", [
        "users",
        "projects",
        "tasks",
        "images",
        "twitter_posts",
        "telegram_posts",
        "website_analytics",
        "activity_logs",
      ])

    if (tablesError) {
      return NextResponse.json({ error: "表结构验证失败", details: tablesError.message }, { status: 500 })
    }

    const tableNames = tables?.map((t) => t.table_name) || []
    const requiredTables = ["users", "projects"]
    const missingTables = requiredTables.filter((table) => !tableNames.includes(table))

    if (missingTables.length > 0) {
      return NextResponse.json(
        {
          error: "缺少必要的数据表",
          details: `缺少表: ${missingTables.join(", ")}`,
        },
        { status: 500 },
      )
    }

    // 测试数据查询
    const { data: users, error: usersError } = await supabaseAdmin.from("users").select("id, name, email").limit(5)

    if (usersError) {
      return NextResponse.json({ error: "用户数据查询失败", details: usersError.message }, { status: 500 })
    }

    const { data: projects, error: projectsError } = await supabaseAdmin
      .from("projects")
      .select("id, name, status")
      .limit(5)

    if (projectsError) {
      return NextResponse.json({ error: "项目数据查询失败", details: projectsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "系统配置验证成功",
      data: {
        tables_created: tableNames.length,
        tables_list: tableNames,
        users_count: users?.length || 0,
        projects_count: projects?.length || 0,
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
