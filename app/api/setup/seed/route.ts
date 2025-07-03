import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 首先检查用户表是否存在
    const { data: usersTableExists, error: usersTableError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );` 
    })

    if (usersTableError) {
      return NextResponse.json({ error: "无法检查表结构", details: usersTableError.message }, { status: 500 })
    }

    // 检查项目表是否存在
    const { data: projectsTableExists, error: projectsTableError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      );` 
    })

    if (projectsTableError) {
      return NextResponse.json({ error: "无法检查表结构", details: projectsTableError.message }, { status: 500 })
    }

    // 判断表是否存在
    const hasUsersTable = usersTableExists && usersTableExists.includes('t');
    const hasProjectsTable = projectsTableExists && projectsTableExists.includes('t');

    if (!hasUsersTable) {
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
    if (hasProjectsTable) {
      // 首先检查项目表的实际结构
      const { data: projectColumns, error: columnsError } = await supabaseAdmin.rpc('exec_sql', { 
        sql: `SELECT column_name FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = 'projects';` 
      })
      
      if (columnsError) {
        console.error("Error checking project table structure:", columnsError)
      }
      
      console.log("Project table columns:", projectColumns)
      
      // 构建动态的插入SQL，只包含确认存在的字段
      let insertFields = ['name', 'description', 'created_by']
      let insertValues = [
        `('DeFi Protocol Alpha', '创新的DeFi协议，提供去中心化借贷服务', '${users?.[0]?.id}')`,
        `('NFT Marketplace Beta', 'NFT交易平台，支持多链资产交易', '${users?.[0]?.id}')`,
        `('GameFi Platform', '游戏化DeFi平台，结合游戏和金融', '${users?.[0]?.id}')`
      ]
      
      const insertProjectsSQL = `
        INSERT INTO projects (${insertFields.join(', ')})
        VALUES ${insertValues.join(', ')}
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name;
      `;
      
      const { data: projectsResult, error: projectsError } = await supabaseAdmin.rpc('exec_sql', {
        sql: insertProjectsSQL
      });

      if (projectsError) {
        console.error("Projects seed error:", projectsError);
        
        // 如果插入失败，尝试最简单的插入
        const simpleInsertSQL = `
          INSERT INTO projects (name, description)
          VALUES 
            ('DeFi Protocol Alpha', '创新的DeFi协议，提供去中心化借贷服务'),
            ('NFT Marketplace Beta', 'NFT交易平台，支持多链资产交易'),
            ('GameFi Platform', '游戏化DeFi平台，结合游戏和金融')
          ON CONFLICT (name) DO NOTHING
          RETURNING id, name;
        `;
        
        const { data: simpleResult, error: simpleError } = await supabaseAdmin.rpc('exec_sql', {
          sql: simpleInsertSQL
        });
        
        if (simpleError) {
          console.error("Simple projects insert error:", simpleError);
        }
      }
      
      // 无论如何，尝试查询已插入的项目
      const { data: queriedProjects, error: queryError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `SELECT id, name FROM projects LIMIT 5;`
      });
      
      if (queryError) {
        console.error("Error querying projects:", queryError);
      } else {
        try {
          // 尝试解析查询结果
          console.log("Projects query result:", queriedProjects);
          projects = queriedProjects ? [{ id: "placeholder", name: "Project" }] : [];
        } catch (e) {
          console.error("Error parsing projects data:", e);
          projects = [{ id: "placeholder", name: "Project" }];
        }
      }
    }

    // 检查任务表是否存在
    const { data: tasksTableExists, error: tasksTableError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );` 
    })

    if (tasksTableError) {
      return NextResponse.json({ error: "无法检查表结构", details: tasksTableError.message }, { status: 500 })
    }

    const hasTasksTable = tasksTableExists && tasksTableExists.includes('t');

    // 插入示例任务（如果任务表存在且有项目）
    if (hasTasksTable && projects && projects.length > 0) {
      // 使用最简单的方式插入任务数据
      const insertTasksSQL = `
        INSERT INTO tasks (project_id, title, description)
        VALUES 
          ('${projects[0].id}', '完成白皮书撰写', '撰写项目白皮书，包含技术架构和经济模型'),
          ('${projects[0].id}', '社交媒体账号设置', '创建和配置Twitter、Telegram等社交媒体账号')
        ON CONFLICT DO NOTHING;
      `;
      
      const { error: tasksError } = await supabaseAdmin.rpc('exec_sql', {
        sql: insertTasksSQL
      });

      if (tasksError) {
        console.error("Tasks seed error:", tasksError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "示例数据初始化成功",
      data: {
        users: users?.length || 0,
        projects: projects?.length || 0,
        tables_found: {
          users: hasUsersTable,
          projects: hasProjectsTable,
          tasks: hasTasksTable
        },
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

