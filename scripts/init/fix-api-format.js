const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2NzYyMiwiZXhwIjoyMDYyODQzNjIyfQ.8bZkxPdVldfrspFLDdQNqjYDLkkYIKDJWWNfxRk2gXc';

// 创建Supabase客户端（使用服务角色密钥以获取完整权限）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDemoProject() {
  console.log('开始创建演示项目...');
  
  try {
    // 1. 检查是否已存在名为"demo-project-1"的项目
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('name', 'demo-project-1')
      .maybeSingle();
    
    if (checkError) {
      console.error('检查项目时出错:', checkError.message);
      return;
    }
    
    if (existingProject) {
      console.log(`演示项目已存在: ${existingProject.id} - ${existingProject.name}`);
      return existingProject.id;
    }
    
    // 2. 创建演示项目
    const projectData = {
      name: 'demo-project-1',
      description: '这是一个演示项目，用于测试API',
      logo_url: 'https://example.com/demo-logo.png',
      token_symbol: 'DEMO',
      token_contract: '0xdemo1234567890abcdef',
      launch_date: new Date().toISOString(),
      total_supply: 1000000,
      market_cap: 500000
    };
    
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (createError) {
      console.error('创建演示项目失败:', createError.message);
      return;
    }
    
    console.log(`演示项目创建成功: ${project.id} - ${project.name}`);
    
    // 3. 创建一些演示内容
    await createDemoContent(project.id);
    
    return project.id;
  } catch (error) {
    console.error('创建演示项目时出错:', error);
  }
}

async function createDemoContent(projectId) {
  try {
    // 创建Twitter帖子
    const twitterData = {
      project_id: projectId,
      content: '这是一条演示推文 #demo',
      status: 'draft',
      likes_count: 0,
      retweets_count: 0,
      replies_count: 0,
      impressions_count: 0
    };
    
    const { data: tweet, error: tweetError } = await supabase
      .from('twitter_posts')
      .insert(twitterData)
      .select()
      .single();
    
    if (tweetError) {
      console.error('创建演示推文失败:', tweetError.message);
    } else {
      console.log('演示推文创建成功:', tweet.id);
    }
    
    // 创建Telegram帖子
    const telegramData = {
      project_id: projectId,
      content: '这是一条演示Telegram消息',
      post_type: 'text',
      status: 'draft',
      views_count: 0,
      reactions_count: 0,
      shares_count: 0
    };
    
    const { data: telegram, error: telegramError } = await supabase
      .from('telegram_posts')
      .insert(telegramData)
      .select()
      .single();
    
    if (telegramError) {
      console.error('创建演示Telegram帖子失败:', telegramError.message);
    } else {
      console.log('演示Telegram帖子创建成功:', telegram.id);
    }
    
  } catch (error) {
    console.error('创建演示内容时出错:', error);
  }
}

// 执行修复
createDemoProject()
  .then(() => console.log('修复完成'))
  .catch(console.error); 