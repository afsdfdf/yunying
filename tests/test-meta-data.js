// Test script to verify meta data functionality
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bndruoeqxhydszlirmoe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMetaData() {
  console.log('🔍 Testing meta data functionality...\n');

  try {
    // 1. 获取一个项目ID
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1);

    if (projectError) {
      console.error('❌ Error fetching projects:', projectError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.error('❌ No projects found');
      return;
    }

    const project = projects[0];
    console.log(`📋 Using project: ${project.name} (${project.id})\n`);

    // 2. 创建测试推文
    console.log('📝 Creating test tweet with meta data...');
    const metaData = {
      english_content: "🚀 Exciting news! Our DeFi protocol is launching next week!",
      chinese_translation: "🚀 激动人心的消息！我们的DeFi协议下周就要上线了！",
      image_prompt: "A modern DeFi interface with glowing elements and cryptocurrency symbols"
    };
    const tags = ['#DeFi', '#Crypto', '#Launch'];
    
    console.log('Meta data:', JSON.stringify(metaData, null, 2));
    console.log('Tags:', JSON.stringify(tags, null, 2), '\n');

    const { data: tweet, error: createError } = await supabase
      .from('twitter_posts')
      .insert({
        content: metaData.english_content,
        project_id: project.id,
        status: 'draft',
        meta: metaData,
        tags: tags,
        target_likes: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating tweet:', createError);
      return;
    }

    console.log('✅ Test tweet created successfully!');
    console.log(`Tweet ID: ${tweet.id}\n`);

    // 3. 直接从数据库获取推文，查看原始数据
    console.log('🔍 Fetching tweet from database (raw data)...');
    const { data: rawTweet, error: fetchError } = await supabase
      .from('twitter_posts')
      .select('*')
      .eq('id', tweet.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching tweet:', fetchError);
      return;
    }

    console.log('✅ Raw tweet data from database:');
    console.log('Content:', rawTweet.content);
    console.log('Meta (raw):', JSON.stringify(rawTweet.meta, null, 2));
    console.log('Tags (raw):', JSON.stringify(rawTweet.tags, null, 2));
    console.log('Target likes:', rawTweet.target_likes);
    console.log('');

    // 4. 使用getTwitterPosts函数获取推文
    console.log('🔍 Testing getTwitterPosts function...');
    const { data: processedTweets, error: processedError } = await supabase
      .from('twitter_posts')
      .select('*, twitter_post_images(image_id)')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (processedError) {
      console.error('❌ Error fetching processed tweets:', processedError);
      return;
    }

    if (processedTweets && processedTweets.length > 0) {
      const latestTweet = processedTweets[0];
      console.log('✅ Processed tweet data:');
      console.log('Content:', latestTweet.content);
      console.log('Meta (processed):', JSON.stringify(latestTweet.meta, null, 2));
      console.log('Tags (processed):', JSON.stringify(latestTweet.tags, null, 2));
      console.log('');
    }

    // 5. 验证meta数据完整性
    console.log('📊 Meta data validation results:');
    const rawMeta = rawTweet.meta || {};
    console.log(`✅ Chinese translation: ${rawMeta.chinese_translation ? 'Present' : 'Missing'}`);
    console.log(`✅ Image prompt: ${rawMeta.image_prompt ? 'Present' : 'Missing'}`);
    console.log(`✅ Tags: ${rawTweet.tags && rawTweet.tags.length > 0 ? 'Present' : 'Missing'}`);
    console.log(`✅ Target engagement: ${rawTweet.target_likes ? 'Set' : 'Missing'}`);
    console.log('');

    // 6. 测试API端点
    console.log('🌐 Testing API endpoint...');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/twitter-posts?projectId=${project.id}`);
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API response received');
        if (apiData.length > 0) {
          const apiTweet = apiData[0];
          console.log('API tweet meta:', JSON.stringify(apiTweet.meta, null, 2));
        }
      } else {
        console.log(`❌ API error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
    }

    // 7. 清理测试数据
    console.log('🧹 Cleaning up test data...');
    await supabase
      .from('twitter_posts')
      .delete()
      .eq('id', tweet.id);

    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🏁 Test completed!');
}

testMetaData(); 