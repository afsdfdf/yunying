// 测试Supabase连接的简单脚本
const { createClient } = require('@supabase/supabase-js');

// 使用与应用相同的连接信息
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bndruoeqxhydszlirmoe.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g";

async function testConnection() {
  console.log('测试 Supabase 连接...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 10) + '...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 测试基本连接
    console.log('尝试获取会话信息...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('连接错误:', error);
      return;
    }
    
    console.log('连接成功!', data);
    
    // 尝试简单查询
    console.log('尝试简单查询...');
    const { data: queryData, error: queryError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('查询错误:', queryError);
      if (queryError.code === 'PGRST116') {
        console.log('表不存在，这是正常的。');
      }
    } else {
      console.log('查询成功:', queryData);
    }
    
    // 尝试创建一个测试表
    console.log('尝试创建测试表...');
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: 'CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, test_column TEXT);' 
    });
    
    if (createError) {
      console.error('创建表错误:', createError);
    } else {
      console.log('创建表成功或表已存在');
    }
    
  } catch (err) {
    console.error('测试过程中发生错误:', err);
  }
}

testConnection(); 