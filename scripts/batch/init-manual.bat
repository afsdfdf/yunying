@echo off
echo 正在初始化数据库...

echo 请先在Supabase控制台中手动执行SQL脚本创建表结构
echo 1. 登录Supabase控制台: https://supabase.com/dashboard/project/bndruoeqxhydszlirmoe
echo 2. 进入SQL编辑器
echo 3. 粘贴scripts/01-create-tables.sql中的内容并执行
echo.
echo 完成上述步骤后，按任意键继续...
pause

echo 开始插入示例数据...
node init-manual.js

echo.
echo 初始化完成!
pause 