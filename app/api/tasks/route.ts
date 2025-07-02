import { NextResponse } from "next/server"
import { getTasks, createTask, updateTaskStatus } from "@/lib/database"

/** GET /api/tasks?projectId=xxx */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  try {
    const tasks = await getTasks(projectId)
    return NextResponse.json({ tasks })
  } catch (err) {
    console.error("GET /api/tasks error:", err)
    return NextResponse.json(
      { error: "无法加载任务", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** POST /api/tasks */
export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data?.title || !data?.project_id) {
      return NextResponse.json({ error: "title & project_id are required" }, { status: 400 })
    }

    const task = await createTask(data)
    return NextResponse.json({ task }, { status: 201 })
  } catch (err) {
    console.error("POST /api/tasks error:", err)
    return NextResponse.json(
      { error: "任务创建失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** PATCH /api/tasks */
export async function PATCH(req: Request) {
  try {
    const { taskId, status } = await req.json()

    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId & status are required" }, { status: 400 })
    }

    const task = await updateTaskStatus(taskId, status)
    return NextResponse.json({ task })
  } catch (err) {
    console.error("PATCH /api/tasks error:", err)
    return NextResponse.json(
      { error: "任务状态更新失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
