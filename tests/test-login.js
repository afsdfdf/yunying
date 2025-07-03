const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g';

// 用户信息
const USER_EMAIL = 'fortunaeduardo364@gmail.com';
const USER_PASSWORD = 'changcheng';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  console.log(`开始测试登录: ${USER_EMAIL}`);

  try {
    // 使用邮箱和密码登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });

    if (error) {
      console.error('登录失败:', error.message);
      return;
    }

    console.log('登录成功!');
    console.log('用户ID:', data.user.id);
    console.log('访问令牌:', data.session.access_token.substring(0, 20) + '...');

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('获取用户详细信息失败:', userError.message);
      return;
    }

    console.log('用户详细信息:');
    console.log('- 名称:', userData.name);
    console.log('- 角色:', userData.role);
    console.log('- 状态:', userData.status);

    // 登出
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('登出失败:', signOutError.message);
    } else {
      console.log('已成功登出');
    }
  } catch (error) {
    console.error('测试过程中发生异常:', error);
  }
}

// 执行测试
testLogin(); 