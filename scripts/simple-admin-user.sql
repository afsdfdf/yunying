-- 简化版管理员用户创建脚本

-- 1. 直接在public.users表中创建管理员用户
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(), -- 生成新的UUID
  '系统管理员',
  'fortunaeduardo364@gmail.com',
  '管理员',
  'active',
  now(),
  now()
);

-- 输出结果
SELECT '管理员用户已创建，请在应用中设置密码' AS result; 