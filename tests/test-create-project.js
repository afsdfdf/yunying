const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g';

// 用户信息
const USER_EMAIL = 'fortunaeduardo364@gmail.com';
const USER_PASSWORD = 'changcheng';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createProject() {
  console.log('开始创建项目测试...');

  try {
    // 1. 登录
    console.log(`使用 ${USER_EMAIL} 登录...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });

    if (authError) {
      console.error('登录失败:', authError.message);
      return;
    }

    console.log('登录成功!');
    console.log('用户ID:', authData.user.id);

    // 2. 创建项目 - 使用与数据库表结构匹配的字段
    const projectData = {
      name: '测试项目 ' + new Date().toISOString(),
      description: '这是一个通过API创建的测试项目',
      created_by: authData.user.id,
      // 以下是实际表中的字段
      logo_url: 'https://example.com/logo.png',
      token_symbol: 'TEST',
      token_contract: '0x1234567890abcdef',
      launch_date: new Date().toISOString(),
      total_supply: 1000000,
      market_cap: 500000
    };

    console.log('创建项目:', projectData.name);
    
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (projectError) {
      console.error('创建项目失败:', projectError.message);
      return;
    }

    console.log('项目创建成功!');
    console.log('项目ID:', project.id);
    console.log('项目名称:', project.name);
    console.log('项目描述:', project.description);

    // 3. 获取项目列表
    const { data: projects, error: listError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('获取项目列表失败:', listError.message);
      return;
    }

    console.log(`获取到 ${projects.length} 个项目:`);
    projects.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.token_symbol || 'N/A'})`);
    });

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    // 登出
    await supabase.auth.signOut();
    console.log('已登出');
  }
}

// 执行测试
createProject(); 