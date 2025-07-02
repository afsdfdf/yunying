import { NextResponse } from "next/server"
import { getTelegramPosts, createTelegramPost } from "@/lib/database"

/** GET /api/telegram-posts?projectId=xxx */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  try {
    const posts = await getTelegramPosts(projectId)
    return NextResponse.json({ posts })
  } catch (err) {
    console.error("GET /api/telegram-posts error:", err)
    return NextResponse.json(
      { error: "无法加载Telegram帖子", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** POST /api/telegram-posts */
export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data?.content || !data?.project_id) {
      return NextResponse.json({ error: "content & project_id are required" }, { status: 400 })
    }

    const post = await createTelegramPost(data)
    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    console.error("POST /api/telegram-posts error:", err)
    return NextResponse.json(
      { error: "Telegram帖子创建失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
