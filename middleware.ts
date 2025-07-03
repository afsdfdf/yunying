import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 不需要身份验证的路径
const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // 检查会话
  const { data: { session } } = await supabase.auth.getSession()
  
  // 当前路径
  const path = request.nextUrl.pathname
  
  // 如果是公共路径，允许访问
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    // 如果已登录且尝试访问登录页，重定向到首页
    if (session && path === '/login') {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }
  
  // 如果没有会话且不是公共路径，重定向到登录页
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }
  
  // 用户已登录，允许访问
  return res
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
} 