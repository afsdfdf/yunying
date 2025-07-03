import { NextResponse } from "next/server"
import { getProject, updateProject, deleteProject } from "@/lib/database"

/**
 * Get a specific project
 * GET /api/projects/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProject(params.id)
    
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 })
    }
    
    return NextResponse.json({ project })
  } catch (err) {
    console.error("GET /api/projects/[id] error:", err)
    return NextResponse.json(
      {
        error: "获取项目详情失败",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}

/**
 * Update a project
 * PUT /api/projects/[id]
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    const project = await updateProject(params.id, body)
    return NextResponse.json({ project })
  } catch (err) {
    console.error("PUT /api/projects/[id] error:", err)
    return NextResponse.json(
      {
        error: "更新项目失败",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}

/**
 * Delete a project
 * DELETE /api/projects/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteProject(params.id)
    return NextResponse.json({ message: "项目删除成功" })
  } catch (err) {
    console.error("DELETE /api/projects/[id] error:", err)
    return NextResponse.json(
      {
        error: "删除项目失败",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
} 