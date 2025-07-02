import { NextResponse } from "next/server"
import { saveImageToDatabase } from "@/lib/database"

/** GET /api/images?projectId=xxx */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")

  try {
    // 这里应该添加获取图片列表的数据库函数
    // 暂时返回空数组
    return NextResponse.json({ images: [] })
  } catch (err) {
    console.error("GET /api/images error:", err)
    return NextResponse.json(
      { error: "无法加载图片", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** POST /api/images */
export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data?.filename || !data?.blob_url) {
      return NextResponse.json({ error: "filename & blob_url are required" }, { status: 400 })
    }

    const image = await saveImageToDatabase(data)
    return NextResponse.json({ image }, { status: 201 })
  } catch (err) {
    console.error("POST /api/images error:", err)
    return NextResponse.json(
      { error: "图片保存失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
