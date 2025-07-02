import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 首先检查表是否存在
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["users", "projects"])

    if (tablesError) {
      return NextResponse.json({ error: "无法检查表结构", details: tablesError.message }, { status: 500 })
    }

    const tableNames = tables?.map((t) => t.table_name) || []

    if (!tableNames.includes("users")) {
      return NextResponse.json({ error: "用户表不存在", details: "请先创建数据表" }, { status: 400 })
    }

    // 插入示例用户
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .upsert(
        [
          {
            name: "系统管理员",
            email: "admin@crypto-ops.com",
            role: "管理员",
            status: "active",
          },
          {
            name: "运营专员",
            email: "operator@crypto-ops.com",
            role: "运营人员",
            status: "active",
          },
          {
            name: "数据分析师",
            email: "analyst@crypto-ops.com",
            role: "数据分析师",
            status: "active",
          },
        ],
        {
          onConflict: "email",
        },
      )
      .select()

    if (usersError) {
      console.error("Users seed error:", usersError)
      return NextResponse.json(
        {
          error: "用户数据初始化失败",
          details: usersError.message,
        },
        { status: 500 },
      )
    }

    // 插入示例项目（如果项目表存在）
    let projects = null
    if (tableNames.includes("projects")) {
      const { data: projectsData, error: projectsError } = await supabaseAdmin
        .from("projects")
        .upsert(
          [
            {
              name: "DeFi Protocol Alpha",
              description: "创新的DeFi协议，提供去中心化借贷服务",
              status: "active",
              progress: 75,
              website_url: "https://defi-alpha.com",
              twitter_handle: "@defi_alpha",
              telegram_handle: "@defi_alpha_official",
              created_by: users?.[0]?.id,
            },
            {
              name: "NFT Marketplace Beta",
              description: "NFT交易平台，支持多链资产交易",
              status: "planning",
              progress: 30,
              website_url: "https://nft-beta.com",
              twitter_handle: "@nft_beta",
              telegram_handle: "@nft_beta_official",
              created_by: users?.[0]?.id,
            },
            {
              name: "GameFi Platform",
              description: "游戏化DeFi平台，结合游戏和金融",
              status: "active",
              progress: 90,
              website_url: "https://gamefi.com",
              twitter_handle: "@gamefi_platform",
              telegram_handle: "@gamefi_official",
              created_by: users?.[0]?.id,
            },
          ],
          {
            onConflict: "name",
          },
        )
        .select()

      if (projectsError) {
        console.error("Projects seed error:", projectsError)
      } else {
        projects = projectsData
      }
    }

    // 插入示例任务（如果任务表存在且有项目）
    if (tableNames.includes("tasks") && projects && projects.length > 0) {
      const { error: tasksError } = await supabaseAdmin.from("tasks").upsert(
        [
          {
            project_id: projects[0].id,
            title: "完成白皮书撰写",
            description: "撰写项目白皮书，包含技术架构和经济模型",
            priority: "high",
            status: "in-progress",
            assigned_to: users?.[1]?.id,
            due_date: "2024-02-15",
            created_by: users?.[0]?.id,
          },
          {
            project_id: projects[0].id,
            title: "社交媒体账号设置",
            description: "创建和配置Twitter、Telegram等社交媒体账号",
            priority: "medium",
            status: "completed",
            assigned_to: users?.[1]?.id,
            due_date: "2024-01-10",
            created_by: users?.[0]?.id,
          },
        ],
        {
          onConflict: "project_id,title",
        },
      )

      if (tasksError) {
        console.error("Tasks seed error:", tasksError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "示例数据初始化成功",
      data: {
        users: users?.length || 0,
        projects: projects?.length || 0,
        tables_found: tableNames,
      },
    })
  } catch (error) {
    console.error("Seed data failed:", error)
    return NextResponse.json(
      {
        error: "数据初始化失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
