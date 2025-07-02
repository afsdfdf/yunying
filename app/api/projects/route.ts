import { NextResponse } from "next/server"
import { createProject, getProjects } from "@/lib/database"

/**
 * Create a project
 * POST /api/projects
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.name) {
      return NextResponse.json({ error: "项目名称不能为空" }, { status: 400 })
    }

    const project = await createProject(body)
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error("POST /api/projects error:", err)
    return NextResponse.json(
      {
        error: "创建项目失败",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}

/**
 * List all projects
 * GET /api/projects
 */
export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json({ projects })
  } catch (err) {
    console.error("GET /api/projects error:", err)
    return NextResponse.json(
      {
        error: "获取项目列表失败",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
