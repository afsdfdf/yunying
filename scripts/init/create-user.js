const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NzYyMiwiZXhwIjoyMDYyODQzNjIyfQ.8bZkxPdVldfrspFLDdQNqjYDLkkYIKDJWWNfxRk2gXc';

// 用户信息
const USER_EMAIL = 'fortunaeduardo364@gmail.com';
const USER_PASSWORD = 'changcheng';
const USER_NAME = '系统管理员';
const USER_ROLE = '管理员';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createUser() {
  console.log(`开始处理用户: ${USER_EMAIL}`);

  try {
    // 1. 检查Auth用户是否存在
    const { data: existingUsers, error: existingError } = await supabase.auth.admin.listUsers();
    
    if (existingError) {
      console.error('获取用户列表失败:', existingError);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === USER_EMAIL);
    let userId;

    if (existingUser) {
      console.log('Auth用户已存在，更新密码:', existingUser.id);
      userId = existingUser.id;
      
      // 更新用户密码
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: USER_PASSWORD }
      );
      
      if (updateError) {
        console.error('更新用户密码失败:', updateError);
        return;
      }
    } else {
      // 创建新用户
      console.log('创建新Auth用户...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: USER_NAME,
          role: USER_ROLE
        }
      });
      
      if (createError) {
        console.error('创建Auth用户失败:', createError);
        return;
      }
      
      userId = newUser.user.id;
      console.log('Auth用户创建成功:', userId);
    }

    // 2. 检查public.users表中是否存在用户
    const { data: existingPublicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', USER_EMAIL)
      .single();
    
    if (publicUserError && publicUserError.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('查询public用户失败:', publicUserError);
      // 继续执行，尝试创建或更新用户
    }
    
    if (existingPublicUser) {
      console.log('Public用户已存在，更新ID:', existingPublicUser.id, '->', userId);
      
      // 更新用户记录
      const { error: updateError } = await supabase
        .from('users')
        .update({
          id: userId,
          name: USER_NAME,
          role: USER_ROLE,
          updated_at: new Date().toISOString()
        })
        .eq('email', USER_EMAIL);
      
      if (updateError) {
        console.error('更新public用户失败:', updateError);
        return;
      }
      
      console.log('Public用户更新成功');
    } else {
      console.log('创建新Public用户...');
      
      // 创建新用户记录
      const { data: newPublicUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: USER_NAME,
          email: USER_EMAIL,
          role: USER_ROLE,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('创建public用户失败:', createError);
        return;
      }
      
      console.log('Public用户创建成功:', newPublicUser.id);
    }

    console.log('用户处理完成!');
    console.log(`电子邮件: ${USER_EMAIL}`);
    console.log(`密码: ${USER_PASSWORD}`);
    console.log(`角色: ${USER_ROLE}`);
    console.log(`用户ID: ${userId}`);

  } catch (error) {
    console.error('处理用户过程中发生错误:', error);
  }
}

// 执行创建用户
createUser(); 