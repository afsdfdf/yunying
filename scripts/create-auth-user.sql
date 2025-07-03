-- 创建Supabase Auth用户脚本
-- 此脚本将在auth.users表中创建一个用户，用于Supabase身份验证

-- 1. 直接插入auth.users表
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'fortunaeduardo364@gmail.com',
  crypt('changcheng', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "系统管理员", "role": "管理员"}',
  FALSE,
  FALSE
);

-- 2. 获取刚刚创建的用户ID
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- 获取刚创建的auth用户ID
  SELECT id INTO auth_user_id FROM auth.users WHERE email = 'fortunaeduardo364@gmail.com';
  
  -- 在应用的users表中也创建对应的用户记录
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    status,
    created_at,
    updated_at,
    last_login
  ) VALUES (
    auth_user_id, -- 使用与auth.users相同的ID
    '系统管理员',
    'fortunaeduardo364@gmail.com',
    '管理员',
    'active',
    now(),
    now(),
    now()
  );
    
  -- 输出结果
  RAISE NOTICE '管理员用户创建成功，ID: %', auth_user_id;
END $$;

-- 3. 确保启用了邮箱密码登录
UPDATE auth.config
SET enable_signup = true,
    enable_email_signup = true,
    enable_email_autoconfirm = true;

-- 输出结果
SELECT '管理员用户 fortunaeduardo364@gmail.com 创建成功，密码已设置为 changcheng' AS result; 