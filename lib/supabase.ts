import { createClient } from "@supabase/supabase-js"

// 直接使用提供的环境变量值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://bndruoeqxhydszlirmoe.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g"

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NzYyMiwiZXhwIjoyMDYyODQzNjIyfQ.8bZkxPdVldfrspFLDdQNqjYDLkkYIKDJWWNfxRk2gXc"

// 主要的 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端管理客户端
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// 检查是否在服务端环境
export const isServerSide = typeof window === "undefined"

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          status: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: string
          status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          progress: number
          website_url: string | null
          twitter_handle: string | null
          telegram_handle: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          progress?: number
          website_url?: string | null
          twitter_handle?: string | null
          telegram_handle?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          progress?: number
          website_url?: string | null
          twitter_handle?: string | null
          telegram_handle?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          priority: string
          status: string
          assigned_to: string | null
          due_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
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
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          file_size: number
          mime_type: string
          blob_url: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          project_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          file_size?: number
          mime_type?: string
          blob_url?: string
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          project_id?: string | null
          created_at?: string
        }
      }
      twitter_posts: {
        Row: {
          id: string
          project_id: string
          content: string
          status: string
          scheduled_for: string | null
          published_at: string | null
          twitter_id: string | null
          likes_count: number
          retweets_count: number
          replies_count: number
          impressions_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          content: string
          status?: string
          scheduled_for?: string | null
          published_at?: string | null
          twitter_id?: string | null
          likes_count?: number
          retweets_count?: number
          replies_count?: number
          impressions_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          content?: string
          status?: string
          scheduled_for?: string | null
          published_at?: string | null
          twitter_id?: string | null
          likes_count?: number
          retweets_count?: number
          replies_count?: number
          impressions_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      telegram_posts: {
        Row: {
          id: string
          project_id: string
          content: string
          post_type: string
          status: string
          scheduled_for: string | null
          published_at: string | null
          telegram_message_id: string | null
          views_count: number
          reactions_count: number
          shares_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          content: string
          post_type?: string
          status?: string
          scheduled_for?: string | null
          published_at?: string | null
          telegram_message_id?: string | null
          views_count?: number
          reactions_count?: number
          shares_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          content?: string
          post_type?: string
          status?: string
          scheduled_for?: string | null
          published_at?: string | null
          telegram_message_id?: string | null
          views_count?: number
          reactions_count?: number
          shares_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      website_analytics: {
        Row: {
          id: string
          project_id: string
          date: string
          visits: number
          unique_visitors: number
          page_views: number
          avg_session_duration: number
          bounce_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          visits?: number
          unique_visitors?: number
          page_views?: number
          avg_session_duration?: number
          bounce_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          visits?: number
          unique_visitors?: number
          page_views?: number
          avg_session_duration?: number
          bounce_rate?: number
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}
