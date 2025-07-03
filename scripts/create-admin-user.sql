-- 创建管理员用户脚本
-- 此脚本将创建一个管理员用户并设置验证登录

-- 0. 确保users表的email列有唯一约束
DO $$
BEGIN
  -- 检查是否已存在唯一约束
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' AND conrelid = 'public.users'::regclass
  ) THEN
    -- 添加唯一约束
    EXECUTE 'ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email)';
  END IF;
END $$;

-- 1. 首先在auth.users表中创建用户（这是Supabase身份验证系统的表）
DO $$
DECLARE
  user_exists boolean;
  new_user_id UUID := uuid_generate_v4();
BEGIN
  -- 检查用户是否已存在
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'fortunaeduardo364@gmail.com'
  ) INTO user_exists;
  
  -- 如果用户不存在，则创建
  IF NOT user_exists THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'fortunaeduardo364@gmail.com',
      crypt('changcheng', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "系统管理员", "role": "管理员"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    RAISE NOTICE '已在auth.users表中创建用户，ID: %', new_user_id;
  ELSE
    -- 如果用户已存在，获取其ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'fortunaeduardo364@gmail.com';
    RAISE NOTICE '用户已存在于auth.users表中，ID: %', new_user_id;
  END IF;
  
  -- 2. 在应用的users表中也创建对应的用户记录
  -- 首先检查用户是否已存在
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'fortunaeduardo364@gmail.com'
  ) INTO user_exists;
  
  -- 如果用户不存在，则创建
  IF NOT user_exists THEN
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
      new_user_id, -- 使用与auth.users相同的ID
      '系统管理员',
      'fortunaeduardo364@gmail.com',
      '管理员',
      'active',
      now(),
      now(),
      now()
    );
    RAISE NOTICE '已在public.users表中创建用户';
  ELSE
    -- 如果用户已存在，更新最后登录时间
    UPDATE public.users 
    SET last_login = now(),
        updated_at = now()
    WHERE email = 'fortunaeduardo364@gmail.com';
    RAISE NOTICE '已更新public.users表中的用户信息';
  END IF;
  
  RAISE NOTICE '管理员用户创建/更新成功，ID: %', new_user_id;
END $$;

-- 3. 确保启用了邮箱密码登录
UPDATE auth.config
SET enable_signup = true,
    enable_email_signup = true,
    enable_email_autoconfirm = true;
    
-- 4. 创建RLS策略，允许管理员访问所有数据
-- 为users表创建RLS策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access_users ON public.users;
CREATE POLICY admin_all_access_users ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = '管理员');

-- 为projects表创建RLS策略
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access_projects ON public.projects;
CREATE POLICY admin_all_access_projects ON public.projects
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = '管理员');

-- 为tasks表创建RLS策略
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_all_access_tasks ON public.tasks;
CREATE POLICY admin_all_access_tasks ON public.tasks
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = '管理员');

-- 输出结果
SELECT '管理员用户 fortunaeduardo364@gmail.com 创建成功，密码已设置为 changcheng' AS result; 