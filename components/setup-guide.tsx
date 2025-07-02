"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Copy } from "lucide-react"

export default function SetupGuide() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sqlFunction = `CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>环境变量已配置</span>
          </CardTitle>
          <CardDescription>所有必要的环境变量已经内置到代码中，无需额外配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 配置状态 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">配置状态</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Supabase 连接配置</strong>
                  <br />
                  URL 和密钥已内置配置
                </AlertDescription>
              </Alert>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>服务角色密钥</strong>
                  <br />
                  管理员操作密钥已配置
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* 下一步操作 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">初始化步骤</h3>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                      1
                    </span>
                    在 Supabase 中创建执行函数
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">在 Supabase SQL Editor 中执行以下 SQL：</p>
                  <div className="bg-gray-100 p-3 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">{sqlFunction}</pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(sqlFunction)}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/bndruoeqxhydszlirmoe/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      打开 Supabase SQL Editor
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                      2
                    </span>
                    运行自动配置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">完成上述步骤后，运行自动配置来创建数据表和初始数据：</p>
                  <div className="flex space-x-2">
                    <Button asChild>
                      <a href="/setup">开始自动配置</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/database-test">检查数据库状态</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 配置详情 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">已配置的环境变量</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Supabase URL:</p>
                    <p className="text-muted-foreground font-mono">https://bndruoeqxhydszlirmoe.supabase.co</p>
                  </div>
                  <div>
                    <p className="font-medium">数据库主机:</p>
                    <p className="text-muted-foreground font-mono">db.bndruoeqxhydszlirmoe.supabase.co</p>
                  </div>
                  <div>
                    <p className="font-medium">匿名密钥:</p>
                    <p className="text-muted-foreground font-mono">已配置 ✓</p>
                  </div>
                  <div>
                    <p className="font-medium">服务角色密钥:</p>
                    <p className="text-muted-foreground font-mono">已配置 ✓</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
