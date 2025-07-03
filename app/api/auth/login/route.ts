import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // 获取请求体中的邮箱和密码
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      )
    }
    
    // 使用Supabase Auth进行登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: "获取用户信息失败" },
        { status: 500 }
      )
    }
    
    // 更新最后登录时间
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.user.id)
    
    // 登录成功，返回用户信息
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
      },
      session: data.session,
    })
  } catch (error) {
    console.error("登录处理错误:", error)
    return NextResponse.json(
      { error: "登录过程中发生错误" },
      { status: 500 }
    )
  }
} 