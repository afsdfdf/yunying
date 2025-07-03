import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/** PATCH /api/twitter-posts/[id]  ——  更新指定推文 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Tweet ID is required" }, { status: 400 })
    }

    // 如果包含images字段，需要特殊处理
    if (data.images && Array.isArray(data.images)) {
      try {
        // 1. 删除现有的图片关联
        const { error: deleteError } = await supabase
          .from('twitter_post_images')
          .delete()
          .eq('post_id', id)

        if (deleteError) {
          console.error("Delete existing images error:", deleteError)
          return NextResponse.json(
            { error: "删除现有图片关联失败", details: deleteError.message },
            { status: 500 }
          )
        }

        // 2. 插入新的图片关联
        if (data.images.length > 0) {
          const imageRelations = data.images.map((imageId: string, index: number) => ({
            post_id: id,
            image_id: imageId,
            sort_order: index
          }))

          const { error: insertError } = await supabase
            .from('twitter_post_images')
            .insert(imageRelations)

          if (insertError) {
            console.error("Insert new images error:", insertError)
            return NextResponse.json(
              { error: "插入新图片关联失败", details: insertError.message },
              { status: 500 }
            )
          }
        }

        // 移除images字段，避免更新twitter_posts表
        delete data.images
      } catch (error) {
        console.error("Image association error:", error)
        return NextResponse.json(
          { error: "图片关联处理失败", details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    }

    // 更新推文的其他字段（如果有的话）
    if (Object.keys(data).length > 0) {
      const { data: updatedTweet, error } = await supabase
        .from('twitter_posts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error("PATCH /api/twitter-posts/[id] error:", error)
        return NextResponse.json(
          { error: "推文更新失败", details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ tweet: updatedTweet })
    }

    // 如果没有其他字段需要更新，返回成功
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PATCH /api/twitter-posts/[id] error:", err)
    return NextResponse.json(
      { error: "推文更新失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
} 