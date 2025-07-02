/**
 * A tiny typed helper around Neon.
 *
 * NOTE: POSTGRES_URL is already present in your environment variables
 * (see the Variables panel on the right in v0). Nothing else to configure.
 */
import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

const DATABASE_URL = process.env.POSTGRES_URL
/**
 * In the browser bundle we cannot read server-only env vars.
 * Fail loudly only on the server; on the client we lazily
 * throw when the DB helpers are actually invoked.
 */
const isBrowser = typeof window !== "undefined"
if (!DATABASE_URL && !isBrowser) {
  throw new Error("POSTGRES_URL environment variable is missing – define it in your project settings (server-side).")
}

/**
 * Singleton pattern recommended by Neon: keep a single
 * QueryFunction around instead of constructing one per request.
 */
let cachedSql: NeonQueryFunction<string[]> | null = null
function sql(): NeonQueryFunction<string[]> {
  if (cachedSql) return cachedSql
  cachedSql = neon(DATABASE_URL)
  return cachedSql
}

/** ---------- Runtime guard for client bundle ---------- */
function ensureServerSide() {
  if (isBrowser) {
    throw new Error("Database helpers must be called from the server (or an API route/server action).")
  }
}

/* ----------  Domain models  ---------- */

export type ProjectRow = {
  id: number
  name: string
  description: string | null
  status: string
  progress: number
  website_url: string | null
  twitter_handle: string | null
  telegram_handle: string | null
  created_by: number | null
  created_at: Date
}

export type ImagesRow = {
  id: number
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  blob_url: string
  width: number | null
  height: number | null
  uploaded_by: number | null
  project_id: number | null
  created_at: Date
  category?: string
  tags?: string[]
}

export type TwitterPostRow = {
  id: number
  content: string
  status: string // draft | scheduled | posted | failed
  scheduled_at: Date | null
  posted_at: Date | null
  twitter_post_id: string | null
  project_id: number | null
  created_by: number | null
  created_at: Date
  likes_count: number
  retweets_count: number
  replies_count: number
  impressions_count: number
  target_likes?: number
  target_retweets?: number
  target_replies?: number
  images?: string[]
}

export type TelegramPostRow = {
  id: number
  content: string
  post_type: string // text | text_with_image | ……
  status: string // draft | scheduled | published | failed
  scheduled_for: Date | null
  published_at: Date | null
  telegram_message_id: string | null
  views_count: number
  reactions_count: number
  shares_count: number
  project_id: number | null
  created_by: number | null
  created_at: Date
  images?: string[]
}

export type TasksRow = {
  id: number
  project_id: number
  title: string
  description: string | null
  priority: string
  status: string
  assigned_to: number | null
  due_date: Date | null
  created_by: number | null
  created_at: Date
  updated_at: Date
  task_type?: string // tweet | telegram | image_upload | general
  target_metrics?: any
  actual_metrics?: any
}

export type UsersRow = {
  id: number
  name: string
  email: string
  role: string
  status: string
  avatar_url: string | null
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

/* ----------  CRUD helpers  ---------- */

export async function createProject(data: Partial<ProjectRow>): Promise<ProjectRow> {
  ensureServerSide()
  const {
    name,
    description = null,
    status = "planning",
    progress = 0,
    website_url = null,
    twitter_handle = null,
    telegram_handle = null,
    created_by = null,
  } = data

  if (!name) {
    throw new Error("项目名称不能为空")
  }

  const [project] = await sql()<ProjectRow[]>`
  INSERT INTO projects
    (name, description, status, progress,
     website_url, twitter_handle, telegram_handle, created_by)
  VALUES
    (${name}, ${description}, ${status}, ${progress},
     ${website_url}, ${twitter_handle}, ${telegram_handle}, ${created_by})
  RETURNING *
`
  return project
}

export async function getProjects(): Promise<ProjectRow[]> {
  ensureServerSide()
  return sql()<ProjectRow[]>`SELECT * FROM projects ORDER BY created_at DESC`
}

export async function updateProject(projectId: string | number, updates: Partial<ProjectRow>): Promise<ProjectRow> {
  ensureServerSide()

  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ")

  const values = Object.values(updates)

  const [project] = await sql()<ProjectRow[]>`
    UPDATE projects 
    SET ${setClause}, updated_at = NOW()
    WHERE id = ${projectId}
    RETURNING *
  `
  return project
}

/**
 * Insert a new record into the twitter_posts table.
 * Returns the inserted row.
 */
export async function createTwitterPost(data: Partial<TwitterPostRow>): Promise<TwitterPostRow> {
  ensureServerSide()
  const {
    content,
    status = "draft",
    scheduled_at = null,
    posted_at = null,
    twitter_post_id = null,
    project_id = null,
    created_by = null,
    target_likes = null,
    target_retweets = null,
    target_replies = null,
  } = data

  if (!content) {
    throw new Error("推文内容不能为空")
  }

  const [row] = await sql()<TwitterPostRow[]>`
  INSERT INTO twitter_posts
    (content, status, scheduled_at, posted_at,
     twitter_post_id, project_id, created_by,
     target_likes, target_retweets, target_replies)
  VALUES
    (${content}, ${status}, ${scheduled_at}, ${posted_at},
     ${twitter_post_id}, ${project_id}, ${created_by},
     ${target_likes}, ${target_retweets}, ${target_replies})
  RETURNING *
`
  return row
}

/**
 * Batch create multiple twitter posts
 */
export async function createTwitterPostsBatch(posts: Partial<TwitterPostRow>[]): Promise<TwitterPostRow[]> {
  ensureServerSide()

  const results: TwitterPostRow[] = []

  for (const postData of posts) {
    const post = await createTwitterPost(postData)
    results.push(post)
  }

  return results
}

/**
 * Get all twitter posts for a project (newest first).
 */
export async function getTwitterPosts(projectId: number | string): Promise<TwitterPostRow[]> {
  ensureServerSide()
  return sql()<TwitterPostRow[]>`
  SELECT *
  FROM twitter_posts
  WHERE project_id = ${projectId}
  ORDER BY created_at DESC
`
}

/**
 * Insert a new telegram post and return the row.
 */
export async function createTelegramPost(data: Partial<TelegramPostRow>): Promise<TelegramPostRow> {
  ensureServerSide()
  const {
    content,
    post_type = "text",
    status = "draft",
    scheduled_for = null,
    published_at = null,
    telegram_message_id = null,
    views_count = 0,
    reactions_count = 0,
    shares_count = 0,
    project_id = null,
    created_by = null,
  } = data

  if (!content) throw new Error("帖子内容不能为空")

  const [row] = await sql()<TelegramPostRow[]>`
  INSERT INTO telegram_posts
    (content, post_type, status, scheduled_for, published_at,
     telegram_message_id, views_count, reactions_count, shares_count,
     project_id, created_by)
  VALUES
    (${content}, ${post_type}, ${status}, ${scheduled_for}, ${published_at},
     ${telegram_message_id}, ${views_count}, ${reactions_count}, ${shares_count},
     ${project_id}, ${created_by})
  RETURNING *
`
  return row
}

/**
 * Get all telegram posts for a given project (newest first).
 */
export async function getTelegramPosts(projectId: number | string): Promise<TelegramPostRow[]> {
  ensureServerSide()
  return sql()<TelegramPostRow[]>`
  SELECT *
  FROM telegram_posts
  WHERE project_id = ${projectId}
  ORDER BY created_at DESC
`
}

/**
 * Save an uploaded image's metadata to the images table.
 * Returns the full inserted row.
 */
export async function saveImageToDatabase(image: Partial<ImagesRow>): Promise<ImagesRow> {
  ensureServerSide()
  const {
    filename,
    original_name,
    file_size,
    mime_type,
    blob_url,
    width = null,
    height = null,
    uploaded_by = null,
    project_id = null,
    category = null,
    tags = null,
  } = image

  if (!filename || !original_name || !file_size || !mime_type || !blob_url) {
    throw new Error("缺少必要的图片字段")
  }

  const [row] = await sql()<ImagesRow[]>`
  INSERT INTO images
    (filename, original_name, file_size, mime_type, blob_url,
     width, height, uploaded_by, project_id, category, tags)
  VALUES
    (${filename}, ${original_name}, ${file_size}, ${mime_type}, ${blob_url},
     ${width}, ${height}, ${uploaded_by}, ${project_id}, ${category}, ${JSON.stringify(tags)})
  RETURNING *
`
  return row
}

/**
 * Get images for a project
 */
export async function getImages(projectId: string | number, category?: string): Promise<ImagesRow[]> {
  ensureServerSide()

  if (category) {
    return sql()<ImagesRow[]>`
    SELECT * FROM images 
    WHERE project_id = ${projectId} AND category = ${category}
    ORDER BY created_at DESC
  `
  }

  return sql()<ImagesRow[]>`
  SELECT * FROM images 
  WHERE project_id = ${projectId}
  ORDER BY created_at DESC
`
}

/**
 * Get a single project by id.
 */
export async function getProject(projectId: string | number): Promise<ProjectRow | null> {
  ensureServerSide()

  const rows = await sql()<ProjectRow[]>`
  SELECT *
  FROM projects
  WHERE id = ${projectId}
  LIMIT 1
`

  return rows.length ? rows[0] : null
}

/**
 * Get all tasks for a project (newest first).
 */
export async function getTasks(projectId: string | number): Promise<TasksRow[]> {
  ensureServerSide()

  const rows = await sql()<TasksRow[]>`
  SELECT *
  FROM tasks
  WHERE project_id = ${projectId}
  ORDER BY created_at DESC
`

  return rows
}

/**
 * Create a new task
 */
export async function createTask(data: Partial<TasksRow>): Promise<TasksRow> {
  ensureServerSide()

  const {
    project_id,
    title,
    description = null,
    priority = "medium",
    status = "pending",
    assigned_to = null,
    due_date = null,
    created_by = null,
    task_type = "general",
    target_metrics = null,
  } = data

  if (!project_id || !title) {
    throw new Error("project_id and title are required")
  }

  const [task] = await sql()<TasksRow[]>`
  INSERT INTO tasks
    (project_id, title, description, priority, status,
     assigned_to, due_date, created_by, task_type, target_metrics)
  VALUES
    (${project_id}, ${title}, ${description}, ${priority}, ${status},
     ${assigned_to}, ${due_date}, ${created_by}, ${task_type}, ${JSON.stringify(target_metrics)})
  RETURNING *
`
  return task
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string | number,
  status: string,
  actualMetrics?: any,
): Promise<TasksRow> {
  ensureServerSide()

  const [task] = await sql()<TasksRow[]>`
  UPDATE tasks 
  SET status = ${status}, 
      actual_metrics = ${actualMetrics ? JSON.stringify(actualMetrics) : null},
      updated_at = NOW()
  WHERE id = ${taskId}
  RETURNING *
`
  return task
}

/**
 * Get users
 */
export async function getUsers(): Promise<UsersRow[]> {
  ensureServerSide()
  return sql()<UsersRow[]>`SELECT * FROM users ORDER BY created_at DESC`
}

/**
 * Get website analytics
 */
export async function getWebsiteAnalytics(): Promise<any[]> {
  ensureServerSide()
  return sql()<any[]>`SELECT * FROM website_analytics ORDER BY date DESC LIMIT 30`
}
