import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "SQL 语句不能为空" }, { status: 400 })
    }

    // Execute SQL using Supabase's raw SQL execution
    const { data, error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("SQL execution error:", error)
      return NextResponse.json({ error: "SQL 执行失败", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("SQL execution failed:", error)
    return NextResponse.json(
      { error: "SQL 执行失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 },
    )
  }
}
