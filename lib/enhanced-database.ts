import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Tables = Database["public"]["Tables"]

// Enhanced project management
export async function getProjectWithDetails(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      created_user:created_by(name, email),
      tasks(count),
      twitter_posts(count),
      telegram_posts(count),
      social_accounts(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function updateProjectProgress(id: string) {
  // Calculate progress based on completed tasks
  const { data: tasks } = await supabase.from("tasks").select("status").eq("project_id", id)

  if (tasks && tasks.length > 0) {
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const progress = Math.round((completedTasks / tasks.length) * 100)

    await supabase.from("projects").update({ progress }).eq("id", id)
  }
}

// Social accounts management
export async function getSocialAccounts(projectId: string) {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_active", true)

  if (error) throw error
  return data
}

export async function createSocialAccount(account: Tables["social_accounts"]["Insert"]) {
  const { data, error } = await supabase.from("social_accounts").insert(account).select().single()

  if (error) throw error
  return data
}

export async function updateSocialAccountMetrics(
  accountId: string,
  metrics: {
    follower_count?: number
    following_count?: number
    last_sync?: string
  },
) {
  const { data, error } = await supabase
    .from("social_accounts")
    .update({
      ...metrics,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Content templates
export async function getContentTemplates(projectId: string) {
  const { data, error } = await supabase
    .from("content_templates")
    .select(`
      *,
      created_user:created_by(name, email)
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createContentTemplate(template: Tables["content_templates"]["Insert"]) {
  const { data, error } = await supabase.from("content_templates").insert(template).select().single()

  if (error) throw error
  return data
}

export async function updateContentTemplate(id: string, updates: Tables["content_templates"]["Update"]) {
  const { data, error } = await supabase
    .from("content_templates")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Scheduled posts
export async function getScheduledPosts(projectId: string, status?: string) {
  let query = supabase
    .from("scheduled_posts")
    .select(`
      *,
      template:template_id(name, category),
      created_user:created_by(name, email)
    `)
    .eq("project_id", projectId)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query.order("scheduled_time", { ascending: true })

  if (error) throw error
  return data
}

export async function createScheduledPost(post: Tables["scheduled_posts"]["Insert"]) {
  const { data, error } = await supabase.from("scheduled_posts").insert(post).select().single()

  if (error) throw error
  return data
}

export async function updateScheduledPostStatus(
  id: string,
  status: string,
  platformPostId?: string,
  errorMessage?: string,
) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "published") {
    updates.published_at = new Date().toISOString()
    if (platformPostId) {
      updates.platform_post_id = platformPostId
    }
  }

  if (status === "failed" && errorMessage) {
    updates.error_message = errorMessage
    updates.retry_count = supabase.rpc("increment_retry_count", { post_id: id })
  }

  const { data, error } = await supabase.from("scheduled_posts").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

// Analytics
export async function getSocialAnalytics(projectId: string, platform?: string, days = 30) {
  let query = supabase
    .from("social_analytics")
    .select("*")
    .eq("project_id", projectId)
    .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("date", { ascending: true })

  if (platform) {
    query = query.eq("platform", platform)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function createSocialAnalytics(analytics: Tables["social_analytics"]["Insert"]) {
  const { data, error } = await supabase
    .from("social_analytics")
    .upsert(analytics, {
      onConflict: "project_id,platform,date",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Hashtags
export async function getHashtags(projectId: string, category?: string) {
  let query = supabase.from("hashtags").select("*").eq("project_id", projectId).eq("is_active", true)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("usage_count", { ascending: false })

  if (error) throw error
  return data
}

export async function createHashtag(hashtag: Tables["hashtags"]["Insert"]) {
  const { data, error } = await supabase
    .from("hashtags")
    .upsert(hashtag, {
      onConflict: "project_id,hashtag",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function incrementHashtagUsage(hashtagId: string) {
  const { data, error } = await supabase.rpc("increment_hashtag_usage", {
    hashtag_id: hashtagId,
  })

  if (error) throw error
  return data
}

// Content approval workflow
export async function getContentApprovals(status?: string) {
  let query = supabase.from("content_approvals").select(`
      *,
      submitted_user:submitted_by(name, email),
      reviewed_user:reviewed_by(name, email)
    `)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query.order("submitted_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createContentApproval(approval: Tables["content_approvals"]["Insert"]) {
  const { data, error } = await supabase.from("content_approvals").insert(approval).select().single()

  if (error) throw error
  return data
}

export async function updateContentApproval(
  id: string,
  updates: {
    status: string
    reviewed_by: string
    review_notes?: string
  },
) {
  const { data, error } = await supabase
    .from("content_approvals")
    .update({
      ...updates,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Enhanced task management
export async function getTasksWithDetails(projectId: string, status?: string) {
  let query = supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:assigned_to(name, email, avatar_url),
      created_user:created_by(name, email)
    `)
    .eq("project_id", projectId)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function updateTaskStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  // Update project progress when task status changes
  if (data) {
    await updateProjectProgress(data.project_id)
  }

  return data
}

// Bulk operations
export async function bulkCreatePosts(posts: Tables["scheduled_posts"]["Insert"][]) {
  const { data, error } = await supabase.from("scheduled_posts").insert(posts).select()

  if (error) throw error
  return data
}

export async function bulkUpdateTaskStatus(taskIds: string[], status: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .in("id", taskIds)
    .select()

  if (error) throw error
  return data
}

// Dashboard summary
export async function getDashboardSummary(projectId: string) {
  const [project, tasks, twitterPosts, analytics] = await Promise.all([
    getProjectWithDetails(projectId),
    getTasksWithDetails(projectId),
    getScheduledPosts(projectId, "published"),
    getSocialAnalytics(projectId, undefined, 7),
  ])

  const activeTasks = tasks.filter((t) => t.status !== "completed").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const totalEngagement = analytics.reduce((sum, a) => sum + (a.likes_count + a.shares_count + a.comments_count), 0)

  return {
    project,
    stats: {
      activeTasks,
      completedTasks,
      totalTasks: tasks.length,
      recentPosts: twitterPosts.length,
      totalEngagement,
      progress: project?.progress || 0,
    },
  }
}
