import { NextResponse } from "next/server"
import { getTwitterPosts, createTwitterPost } from "@/lib/database"

/** GET /api/twitter-posts?projectId=xxx  ——  获取指定项目的推文列表 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  try {
    const tweets = await getTwitterPosts(projectId)
    return NextResponse.json({ tweets })
  } catch (err) {
    console.error("GET /api/twitter-posts error:", err)
    return NextResponse.json(
      { error: "无法加载推文", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** POST /api/twitter-posts  ——  新建一条推文
 *  body: { project_id, content, status?, created_by? }
 */
export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data?.content || !data?.project_id) {
      return NextResponse.json({ error: "content & project_id are required" }, { status: 400 })
    }

    const tweet = await createTwitterPost(data)
    return NextResponse.json({ tweet }, { status: 201 })
  } catch (err) {
    console.error("POST /api/twitter-posts error:", err)
    return NextResponse.json(
      { error: "推文创建失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
