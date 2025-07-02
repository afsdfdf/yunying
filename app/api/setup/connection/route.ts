import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // 测试基本连接
    const { data, error } = await supabaseAdmin
      .schema("information_schema")
      .from("tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

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
