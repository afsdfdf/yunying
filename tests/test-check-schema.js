const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g';

// 用户信息
const USER_EMAIL = 'fortunaeduardo364@gmail.com';
const USER_PASSWORD = 'changcheng';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log('开始检查数据库表结构...');

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
    
    // 2. 获取数据库表结构
    console.log('获取projects表结构...');
    
    // 使用RPC调用查询表结构
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'projects'
    });
    
    if (columnsError) {
      console.error('获取表结构失败:', columnsError.message);
      
      // 尝试直接插入一个简化的项目
      console.log('尝试创建一个简化的项目...');
      const simpleProject = {
        name: '简化测试项目 ' + new Date().toISOString(),
        description: '这是一个简化的测试项目',
        status: 'planning',
        created_by: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(simpleProject)
        .select()
        .single();
      
      if (projectError) {
        console.error('创建简化项目失败:', projectError.message);
        
        // 获取表的一行数据来查看结构
        console.log('尝试获取一个项目来查看结构...');
        const { data: sampleProject, error: sampleError } = await supabase
          .from('projects')
          .select('*')
          .limit(1)
          .single();
        
        if (sampleError) {
          console.error('获取样例项目失败:', sampleError.message);
        } else {
          console.log('项目表结构示例:');
          console.log(JSON.stringify(sampleProject, null, 2));
        }
      } else {
        console.log('简化项目创建成功!');
        console.log('项目ID:', project.id);
        console.log('项目结构:', JSON.stringify(project, null, 2));
      }
    } else {
      console.log('表结构:');
      console.log(columns);
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    // 登出
    await supabase.auth.signOut();
    console.log('已登出');
  }
}

// 执行测试
checkSchema(); 