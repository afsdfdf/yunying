import fetch from 'node-fetch';

// 测试GROQ API集成
async function testGroqIntegration() {
  console.log('=== GROQ API集成测试 ===\n');

  const baseUrl = 'http://localhost:3007'; // 你的实际端口
  const testData = {
    type: 'tweets',
    projectName: 'TestCryptoProject',
    projectDescription: '一个创新的DeFi项目，专注于为用户提供安全、高效的金融服务',
    contentType: 'announcement',
    topics: ['DeFi', '安全', '创新'],
    tone: 'professional',
    language: 'bilingual',
    count: 3,
    includeTranslation: true,
    includeImagePrompt: true
  };

  try {
    console.log('1. 测试推文生成...');
    const response = await fetch(`${baseUrl}/api/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 推文生成成功！');
      console.log(`生成了 ${result.data.length} 条推文`);
      
      result.data.forEach((tweet, index) => {
        console.log(`\n推文 ${index + 1}:`);
        console.log(`英文: ${tweet.englishContent}`);
        if (tweet.chineseTranslation) {
          console.log(`中文: ${tweet.chineseTranslation}`);
        }
        if (tweet.imagePrompt) {
          console.log(`图片提示词: ${tweet.imagePrompt}`);
        }
        console.log(`标签: ${tweet.hashtags.join(', ')}`);
        if (tweet.suggestedTime) {
          console.log(`建议时间: ${tweet.suggestedTime}`);
        }
      });
    } else {
      console.log('❌ 推文生成失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n请确保：');
    console.log('1. 开发服务器正在运行 (pnpm dev)');
    console.log('2. 端口号正确 (默认3004)');
    console.log('3. GROQ API密钥有效');
  }
}

// 运行测试
testGroqIntegration(); 