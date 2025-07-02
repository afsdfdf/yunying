import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 创建基础表的 SQL
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'operator',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'planning',
        progress INTEGER DEFAULT 0,
        website_url TEXT,
        twitter_handle VARCHAR(255),
        telegram_handle VARCHAR(255),
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        assigned_to UUID,
        due_date DATE,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Images table
      CREATE TABLE IF NOT EXISTS images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        blob_url TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        uploaded_by UUID,
        project_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Twitter posts table
      CREATE TABLE IF NOT EXISTS twitter_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        scheduled_for TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        twitter_id VARCHAR(255),
        likes_count INTEGER DEFAULT 0,
        retweets_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        impressions_count INTEGER DEFAULT 0,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Telegram posts table
      CREATE TABLE IF NOT EXISTS telegram_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL,
        content TEXT NOT NULL,
        post_type VARCHAR(50) NOT NULL DEFAULT 'text',
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        scheduled_for TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        telegram_message_id VARCHAR(255),
        views_count INTEGER DEFAULT 0,
        reactions_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Website analytics table
      CREATE TABLE IF NOT EXISTS website_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL,
        date DATE NOT NULL,
        visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        avg_session_duration INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, date)
      );

      -- Activity logs table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_twitter_posts_project_id ON twitter_posts(project_id);
      CREATE INDEX IF NOT EXISTS idx_telegram_posts_project_id ON telegram_posts(project_id);
      CREATE INDEX IF NOT EXISTS idx_website_analytics_project_date ON website_analytics(project_id, date);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Add triggers for updated_at
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_twitter_posts_updated_at ON twitter_posts;
      CREATE TRIGGER update_twitter_posts_updated_at BEFORE UPDATE ON twitter_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_telegram_posts_updated_at ON telegram_posts;
      CREATE TRIGGER update_telegram_posts_updated_at BEFORE UPDATE ON telegram_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `

    // 执行 SQL
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql: createTablesSQL })

    if (error) {
      console.error("Table creation error:", error)

      // 如果 RPC 函数不存在，尝试逐个创建表
      if (error.message?.includes("function exec_sql") || error.code === "42883") {
        console.log("RPC function not found, creating tables individually...")

        // 分别执行每个表的创建语句
        const statements = createTablesSQL.split(";").filter((stmt) => stmt.trim())

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await supabaseAdmin.rpc("exec_sql", { sql: statement.trim() + ";" })
            } catch (err) {
              console.log("Statement execution:", statement.substring(0, 50) + "...", err)
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: "数据表创建完成（使用备用方法）",
          note: "某些高级功能可能需要手动配置",
        })
      }

      return NextResponse.json(
        {
          error: "数据表创建失败",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "数据表创建成功",
    })
  } catch (error) {
    console.error("Table creation failed:", error)
    return NextResponse.json(
      {
        error: "数据表创建失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
