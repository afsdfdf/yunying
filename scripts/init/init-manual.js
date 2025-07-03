const { createClient } = require('@supabase/supabase-js');

// 配置 - 使用应用中已配置的Supabase连接信息
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NzYyMiwiZXhwIjoyMDYyODQzNjIyfQ.8bZkxPdVldfrspFLDdQNqjYDLkkYIKDJWWNfxRk2gXc';

console.log('使用Supabase URL:', SUPABASE_URL);

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 插入示例数据
const insertSampleData = async () => {
  try {
    // 1. 插入用户
    console.log('插入用户数据...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          name: '系统管理员',
          email: 'admin@crypto-ops.com',
          role: '管理员',
          status: 'active',
        },
        {
          name: '运营专员',
          email: 'operator@crypto-ops.com',
          role: '运营人员',
          status: 'active',
        },
        {
          name: '数据分析师',
          email: 'analyst@crypto-ops.com',
          role: '数据分析师',
          status: 'active',
        },
      ], { onConflict: 'email' })
      .select();
    
    if (usersError) {
      console.error('插入用户数据失败:', usersError);
      return false;
    }
    
    console.log('用户数据插入成功:', users?.length || 0, '条记录');
    
    // 获取管理员ID
    const adminId = users?.find(u => u.email === 'admin@crypto-ops.com')?.id;
    
    if (!adminId) {
      console.log('无法获取管理员ID，跳过项目和任务创建');
      return false;
    }
    
    // 2. 插入项目
    console.log('插入项目数据...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .upsert([
        {
          name: 'DeFi Protocol Alpha',
          description: '创新的DeFi协议，提供去中心化借贷服务',
          status: 'active',
          progress: 75,
          created_by: adminId,
        },
        {
          name: 'NFT Marketplace Beta',
          description: 'NFT交易平台，支持多链资产交易',
          status: 'planning',
          progress: 30,
          created_by: adminId,
        },
        {
          name: 'GameFi Platform',
          description: '游戏化DeFi平台，结合游戏和金融',
          status: 'active',
          progress: 90,
          created_by: adminId,
        },
      ], { onConflict: 'name' })
      .select();
    
    if (projectsError) {
      console.error('插入项目数据失败:', projectsError);
      return false;
    }
    
    console.log('项目数据插入成功:', projects?.length || 0, '条记录');
    
    if (!projects || projects.length === 0) {
      console.log('没有项目数据，跳过插入任务');
      return true;
    }
    
    // 3. 插入任务
    console.log('插入任务数据...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .upsert([
        {
          project_id: projects[0].id,
          title: '完成白皮书撰写',
          description: '撰写项目白皮书，包含技术架构和经济模型',
          priority: 'high',
          status: 'in-progress',
          created_by: adminId,
        },
        {
          project_id: projects[0].id,
          title: '社交媒体账号设置',
          description: '创建和配置Twitter、Telegram等社交媒体账号',
          priority: 'medium',
          status: 'completed',
          created_by: adminId,
        },
      ])
      .select();
    
    if (tasksError) {
      console.error('插入任务数据失败:', tasksError);
      return false;
    }
    
    console.log('任务数据插入成功:', tasks?.length || 0, '条记录');
    
    return true;
  } catch (error) {
    console.error('插入示例数据异常:', error);
    return false;
  }
};

// 主函数
const initDatabase = async () => {
  console.log('开始初始化数据库...');
  
  try {
    // 测试连接
    console.log('测试Supabase连接...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase连接失败:', error);
      return;
    }
    
    console.log('Supabase连接成功');
    
    // 插入示例数据
    console.log('开始插入示例数据...');
    const dataInserted = await insertSampleData();
    
    if (!dataInserted) {
      console.log('部分或全部示例数据插入失败');
    }
    
    // 验证结果
    console.log('验证数据库初始化结果...');
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*');
      
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*');
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*');
      
      console.log('初始化完成!');
      console.log('用户数量:', userData?.length || 0);
      console.log('项目数量:', projectData?.length || 0);
      console.log('任务数量:', taskData?.length || 0);
    } catch (e) {
      console.error('验证结果时出错:', e);
    }
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
  }
};

// 执行初始化
initDatabase()
  .catch(error => {
    console.error('初始化过程中发生错误:', error);
  })
  .finally(() => {
    console.log('初始化脚本执行完毕');
  }); 