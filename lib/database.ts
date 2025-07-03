/**
 * A tiny typed helper around Neon.
 *
 * NOTE: POSTGRES_URL is already present in your environment variables
 * (see the Variables panel on the right in v0). Nothing else to configure.
 */
import { createClient } from "@supabase/supabase-js"

// Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://bndruoeqxhydszlirmoe.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g"

/**
 * 创建Supabase客户端
 */
function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * In the browser bundle we cannot read server-only env vars.
 * Fail loudly only on the server; on the client we lazily
 * throw when the DB helpers are actually invoked.
 */
const isBrowser = typeof window !== "undefined"
if (!SUPABASE_URL && !SUPABASE_ANON_KEY && !isBrowser) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are missing – define them in your project settings (server-side).")
}

/** ---------- Runtime guard for client bundle ---------- */
function ensureServerSide() {
  if (isBrowser) {
    throw new Error("Database helpers must be called from the server (or an API route/server action).")
  }
}

/* ----------  Domain models  ---------- */

export type ProjectRow = {
  id: string
  name: string
  description: string | null
  created_at: Date
  logo_url: string | null
  token_symbol: string | null
  token_contract: string | null
  launch_date: Date | null
  total_supply: number | null
  market_cap: number | null
  created_by: string | null
}

export type ImagesRow = {
  id: string
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  blob_url: string
  width: number | null
  height: number | null
  uploaded_by: string | null
  project_id: string | null
  created_at: Date
  updated_at: Date
  category?: string
  tags?: string[]
  description?: string
  alt_text?: string
  is_public?: boolean
  storage_provider?: string
}

export type TwitterPostRow = {
  id: string
  content: string
  status: string // draft | scheduled | posted | failed
  scheduled_for: Date | null
  published_at: Date | null
  twitter_id: string | null
  project_id: string | null
  created_by: string | null
  created_at: Date
  likes_count: number
  retweets_count: number
  replies_count: number
  impressions_count: number
  target_likes?: number
  target_retweets?: number
  target_replies?: number
  images?: string[]
  tags?: string[]
  meta?: {
    english_content?: string
    chinese_translation?: string
    image_prompt?: string
  }
}

export type TelegramPostRow = {
  id: string
  content: string
  post_type: string // text | text_with_image | ……
  status: string // draft | scheduled | published | failed
  scheduled_for: Date | null
  published_at: Date | null
  telegram_message_id: string | null
  views_count: number
  reactions_count: number
  shares_count: number
  project_id: string | null
  created_by: string | null
  created_at: Date
  images?: string[]
}

export type TasksRow = {
  id: string
  project_id: string
  title: string
  description: string | null
  priority: string
  status: string
  assigned_to: string | null
  due_date: Date | null
  created_by: string | null
  created_at: Date
  updated_at: Date
  task_type?: string // tweet | telegram | image_upload | general
  target_metrics?: any
  actual_metrics?: any
}

export type UsersRow = {
  id: string
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
    logo_url = null,
    token_symbol = null,
    token_contract = null,
    launch_date = null,
    total_supply = null,
    market_cap = null,
    created_by = null,
  } = data

  if (!name) {
    throw new Error("项目名称不能为空")
  }

  const supabase = getSupabaseClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      logo_url,
      token_symbol,
      token_contract,
      launch_date,
      total_supply,
      market_cap,
      created_by,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`创建项目失败: ${error.message}`)
  }
  
  return project
}

export async function getProjects(): Promise<ProjectRow[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`获取项目列表失败: ${error.message}`)
  }
  
  return data || []
}

export async function updateProject(projectId: string | number, updates: Partial<ProjectRow>): Promise<ProjectRow> {
  ensureServerSide()

  const supabase = getSupabaseClient()
  
  // 添加更新时间
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(updatedData)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`更新项目失败: ${error.message}`)
  }
  
  return data
}

export async function deleteProject(projectId: string | number): Promise<void> {
  ensureServerSide()

  const supabase = getSupabaseClient()
  
  // 首先删除相关的数据（推文、电报帖子、图片、任务等）
  // 删除推文
  await supabase
    .from('twitter_posts')
    .delete()
    .eq('project_id', projectId)
  
  // 删除电报帖子
  await supabase
    .from('telegram_posts')
    .delete()
    .eq('project_id', projectId)
  
  // 删除图片
  await supabase
    .from('images')
    .delete()
    .eq('project_id', projectId)
  
  // 删除任务
  await supabase
    .from('tasks')
    .delete()
    .eq('project_id', projectId)
  
  // 最后删除项目本身
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
  
  if (error) {
    throw new Error(`删除项目失败: ${error.message}`)
  }
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
    scheduled_for = null,
    published_at = null,
    twitter_id = null,
    project_id = null,
    created_by = null,
    likes_count = 0,
    retweets_count = 0,
    replies_count = 0,
    impressions_count = 0,
    target_likes = null,
    target_retweets = null,
    target_replies = null,
    images = [],
    tags = [],
    meta = {},
  } = data

  if (!content) {
    throw new Error("推文内容不能为空")
  }

  const supabase = getSupabaseClient()
  
  // 创建推文记录，现在包含meta和tags字段
  const { data: post, error } = await supabase
    .from('twitter_posts')
    .insert({
      content,
      status,
      scheduled_for,
      published_at,
      twitter_id,
      project_id,
      created_by,
      likes_count,
      retweets_count,
      replies_count,
      impressions_count,
      target_likes,
      target_retweets,
      target_replies,
      meta: meta || {}, // 使用提供的meta或创建空对象
      tags: tags || [], // 使用提供的tags或创建空数组
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`创建推文失败: ${error.message}`)
  }
  
  // 如果有图片ID，则创建推文与图片的关联
  if (images && images.length > 0 && post.id) {
    try {
      for (let i = 0; i < images.length; i++) {
        const imageId = images[i];
        await supabase
          .from('twitter_post_images')
          .insert({
            post_id: post.id,
            image_id: imageId,
            sort_order: i,
            created_at: new Date().toISOString()
          });
      }
    } catch (imgError) {
      console.error("添加推文图片关联失败:", imgError);
      // 继续返回推文，即使图片关联失败
    }
  }
  
  // 如果有标签，处理标签关联
  if (tags && tags.length > 0 && post.id) {
    try {
      // 将标签数组转换为空格分隔的字符串
      const tagsString = tags.join(' ');
      
      // 调用数据库函数处理标签
      await supabase.rpc('process_tweet_tags', {
        tweet_id: post.id,
        tags_string: tagsString
      });
    } catch (tagError) {
      console.error("处理推文标签失败:", tagError);
      // 继续返回推文，即使标签处理失败
    }
  }
  
  // 返回创建的推文
  return {
    ...post,
    images: images.map(id => ({ id, url: '' })), // 前端可能需要图片URL
    meta: meta || {}
  };
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

// 检查UUID格式并查找项目
async function resolveProjectId(projectId: string | number): Promise<string | null> {
  // 如果是数字或UUID格式，直接返回
  if (typeof projectId === 'number') {
    return String(projectId);
  }
  
  // 简单的UUID格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(projectId)) {
    return projectId;
  }
  
  // 如果不是UUID格式，尝试根据名称查找项目
  console.log(`项目ID不是UUID格式: ${projectId}，尝试查找匹配的项目`);
  
  const supabase = getSupabaseClient();
  const { data: projectData } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectId)
    .maybeSingle();
  
  if (projectData) {
    console.log(`找到匹配的项目: ${projectData.id}`);
    return projectData.id;
  }
  
  console.log(`找不到匹配的项目: ${projectId}`);
  return null;
}

/**
 * Get all twitter posts for a project (newest first).
 */
export async function getTwitterPosts(projectId: string | number): Promise<TwitterPostRow[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  // 解析项目ID，处理非UUID格式
  const resolvedId = await resolveProjectId(projectId);
  if (!resolvedId) {
    // 如果找不到匹配的项目，返回空数组
    return [];
  }
  
  // 获取所有推文，包括meta和tags字段
  const { data: tweets, error } = await supabase
    .from('twitter_posts')
    .select('*, twitter_post_images(image_id)')
    .eq('project_id', resolvedId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`获取推文列表失败: ${error.message}`);
  }
  
  if (!tweets || tweets.length === 0) {
    return [];
  }
  
  // 获取所有图片ID
  const imageIds: string[] = [];
  tweets.forEach(tweet => {
    if (tweet.twitter_post_images && tweet.twitter_post_images.length > 0) {
      tweet.twitter_post_images.forEach((img: any) => {
        if (img.image_id) {
          imageIds.push(img.image_id);
        }
      });
    }
  });
  
  // 获取所有相关的图片详情
  let imagesData: any[] = [];
  if (imageIds.length > 0) {
    const { data: images, error: imgError } = await supabase
      .from('images')
      .select('*')
      .in('id', imageIds);
      
    if (imgError) {
      console.error("获取图片详情失败:", imgError);
    } else {
      imagesData = images || [];
    }
  }
  
  // 创建图片ID到URL的映射
  const imageUrlMap: Record<string, string> = {};
  for (const img of imagesData) {
    imageUrlMap[img.id] = img.blob_url;
  }
  
  // 处理推文数据
  return tweets.map(tweet => {
    // 提取图片信息
    const images = tweet.twitter_post_images 
      ? tweet.twitter_post_images.map((img: any) => ({
          id: img.image_id,
          url: imageUrlMap[img.image_id] || ''
        }))
      : [];
    
    // 确保meta字段存在，并保持原始数据的完整性
    const meta = tweet.meta || {};
    
    // 返回处理后的推文对象，保持原始meta数据的完整性
    return {
      ...tweet,
      // 字段映射：数据库字段名 -> 前端期望的字段名
      publishedAt: tweet.published_at,
      scheduledFor: tweet.scheduled_for,
      createdAt: tweet.created_at,
      images,
      twitter_post_images: undefined, // 移除嵌套的关联数据
      meta: {
        english_content: meta.english_content || tweet.content,
        chinese_translation: meta.chinese_translation || '',
        image_prompt: meta.image_prompt || ''
      },
      // 添加engagement对象以兼容前端组件
      engagement: {
        likes: tweet.likes_count || 0,
        retweets: tweet.retweets_count || 0,
        replies: tweet.replies_count || 0,
        views: tweet.impressions_count || 0,
        target_likes: tweet.target_likes,
        target_retweets: tweet.target_retweets,
        target_replies: tweet.target_replies
      }
    };
  });
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

  const supabase = getSupabaseClient()
  
  const { data: row, error } = await supabase
    .from('telegram_posts')
    .insert({
      content,
      post_type,
      status,
      scheduled_for,
      published_at,
      telegram_message_id,
      views_count,
      reactions_count,
      shares_count,
      project_id,
      created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`创建帖子失败: ${error.message}`)
  }
  
  return row
}

/**
 * Get all telegram posts for a given project (newest first).
 */
export async function getTelegramPosts(projectId: string | number): Promise<TelegramPostRow[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  // 解析项目ID，处理非UUID格式
  const resolvedId = await resolveProjectId(projectId);
  if (!resolvedId) {
    // 如果找不到匹配的项目，返回空数组
    return [];
  }
  
  const { data, error } = await supabase
    .from('telegram_posts')
    .select('*')
    .eq('project_id', resolvedId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`获取帖子列表失败: ${error.message}`);
  }
  
  return data || [];
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
    description = null,
    alt_text = null,
    is_public = true,
    storage_provider = 'cloudinary',
  } = image

  if (!filename || !original_name || !file_size || !mime_type || !blob_url) {
    throw new Error("缺少必要的图片字段")
  }

  const supabase = getSupabaseClient()
  
  const { data: row, error } = await supabase
    .from('images')
    .insert({
      filename,
      original_name,
      name: original_name,
      file_size,
      mime_type,
      blob_url,
      width,
      height,
      uploaded_by,
      project_id,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      description,
      alt_text,
      is_public,
      storage_provider,
      url: blob_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`保存图片元数据失败: ${error.message}`)
  }
  
  return row
}

/**
 * Get all images for a project, optionally filtered by category.
 */
export async function getImages(projectId: string | number, category?: string): Promise<ImagesRow[]> {
  ensureServerSide()
  
  // 解析项目ID，处理非UUID格式
  const resolvedId = await resolveProjectId(projectId);
  if (!resolvedId) {
    // 如果找不到匹配的项目，返回空数组
    return [];
  }

  const supabase = getSupabaseClient()
  
  if (category) {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('project_id', resolvedId)
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`获取图片列表失败: ${error.message}`);
    }
    
    return data || [];
  }

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('project_id', resolvedId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`获取图片列表失败: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get a project by ID.
 */
export async function getProject(projectId: string | number): Promise<ProjectRow | null> {
  ensureServerSide()
  
  // 解析项目ID，处理非UUID格式
  const resolvedId = await resolveProjectId(projectId);
  if (!resolvedId) {
    // 如果找不到匹配的项目，返回null
    return null;
  }
  
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', resolvedId)
    .single();
  
  if (error) {
    console.error(`获取项目失败: ${error.message}`);
    return null;
  }
  
  return data;
}

/**
 * Get all tasks for a project or all tasks if no projectId.
 */
export async function getTasks(projectId?: string | number): Promise<TasksRow[]> {
  ensureServerSide()
  const supabase = getSupabaseClient()
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (projectId) {
    // 解析项目ID，处理非UUID格式
    const resolvedId = await resolveProjectId(projectId);
    if (resolvedId) {
      query = query.eq('project_id', resolvedId)
    }
  }
  const { data, error } = await query
  if (error) {
    throw new Error(`获取任务列表失败: ${error.message}`)
  }
  return data || []
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

  const supabase = getSupabaseClient()
  
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      project_id,
      title,
      description,
      priority,
      status,
      assigned_to,
      due_date,
      created_by,
      task_type,
      target_metrics: JSON.stringify(target_metrics),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`创建任务失败: ${error.message}`)
  }
  
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

  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      actual_metrics: JSON.stringify(actualMetrics),
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`更新任务状态失败: ${error.message}`)
  }
  
  return data
}

/**
 * Get users
 */
export async function getUsers(): Promise<UsersRow[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`获取用户列表失败: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get website analytics
 */
export async function getWebsiteAnalytics(): Promise<any[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('website_analytics')
    .select('*')
    .order('date', { ascending: false })
    .limit(30)
  
  if (error) {
    throw new Error(`获取网站分析失败: ${error.message}`)
  }
  
  return data || []
}

/**
 * Update image metadata
 */
export async function updateImage(imageId: string, updates: Partial<ImagesRow>): Promise<ImagesRow> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  const { data: image, error } = await supabase
    .from('images')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', imageId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`更新图片失败: ${error.message}`)
  }
  
  return image
}

/**
 * Delete image from database
 */
export async function deleteImage(imageId: string): Promise<void> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)
  
  if (error) {
    throw new Error(`删除图片失败: ${error.message}`)
  }
}

/**
 * Get image statistics for a project
 */
export async function getImageStats(projectId: string): Promise<{
  total_count: number
  total_size: number
  category_counts: Record<string, number>
}> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  // Get total count and size
  const { data: totals, error: totalsError } = await supabase
    .from('images')
    .select('file_size')
    .eq('project_id', projectId)
  
  if (totalsError) {
    throw new Error(`获取图片统计失败: ${totalsError.message}`)
  }
  
  // Get category counts
  const { data: categories, error: categoriesError } = await supabase
    .from('images')
    .select('category')
    .eq('project_id', projectId)
  
  if (categoriesError) {
    throw new Error(`获取分类统计失败: ${categoriesError.message}`)
  }
  
  const total_count = totals?.length || 0
  const total_size = totals?.reduce((sum, img) => sum + (img.file_size || 0), 0) || 0
  
  const category_counts: Record<string, number> = {}
  categories?.forEach(img => {
    const category = img.category || 'uncategorized'
    category_counts[category] = (category_counts[category] || 0) + 1
  })
  
  return {
    total_count,
    total_size,
    category_counts
  }
}

/**
 * Search images by tags
 */
export async function searchImagesByTags(projectId: string, tags: string[]): Promise<ImagesRow[]> {
  ensureServerSide()
  
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('project_id', projectId)
    .overlaps('tags', tags)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`搜索图片失败: ${error.message}`)
  }
  
  return data || []
}
