const fs = require('fs');
const path = require('path');

// 测试批量上传的时间标签功能
console.log('=== 批量上传时间标签功能测试 ===\n');

// 测试数据
const testData = [
  {
    name: '基本时间标签测试',
    input: `[EN] We are excited to announce our new feature!
[CN] 我们很高兴宣布我们的新功能！
[TAGS] #crypto #blockchain #newfeature
[IMG] A modern interface with glowing elements
[TIME] 2024-01-15T10:00:00Z
[END]`,
    expected: {
      englishContent: 'We are excited to announce our new feature!',
      chineseTranslation: '我们很高兴宣布我们的新功能！',
      tags: ['#crypto', '#blockchain', '#newfeature'],
      imagePrompt: 'A modern interface with glowing elements',
      scheduledTime: '2024-01-15T10:00:00Z'
    }
  },
  {
    name: '多推文时间标签测试',
    input: `[EN] First tweet about our project
[CN] 关于我们项目的第一条推文
[TAGS] #project #launch
[IMG] Project logo and interface
[TIME] 2024-01-16T09:00:00Z
[END]

[EN] Second tweet with different time
[CN] 不同时间的第二条推文
[TAGS] #update #news
[IMG] Team meeting scene
[TIME] 2024-01-17T14:30:00Z
[END]`,
    expected: [
      {
        englishContent: 'First tweet about our project',
        chineseTranslation: '关于我们项目的第一条推文',
        tags: ['#project', '#launch'],
        imagePrompt: 'Project logo and interface',
        scheduledTime: '2024-01-16T09:00:00Z'
      },
      {
        englishContent: 'Second tweet with different time',
        chineseTranslation: '不同时间的第二条推文',
        tags: ['#update', '#news'],
        imagePrompt: 'Team meeting scene',
        scheduledTime: '2024-01-17T14:30:00Z'
      }
    ]
  },
  {
    name: '无时间标签测试',
    input: `[EN] Tweet without time tag
[CN] 没有时间标签的推文
[TAGS] #test #no-time
[IMG] Simple test image
[END]`,
    expected: {
      englishContent: 'Tweet without time tag',
      chineseTranslation: '没有时间标签的推文',
      tags: ['#test', '#no-time'],
      imagePrompt: 'Simple test image',
      scheduledTime: undefined
    }
  }
];

// 模拟解析函数（从批量上传组件中提取的逻辑）
function parseTextToTweets(text) {
  if (!text.trim()) return []
  
  const lines = text.split('\n')
  const tweets = []
  
  let currentTweet = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // 跳过空行
    
    // 使用前缀标记来识别内容类型
    if (line.startsWith('[EN]')) {
      // 如果已经有一条推文在处理中，先保存它
      if (currentTweet.englishContent) {
        tweets.push(currentTweet)
        currentTweet = {}
      }
      currentTweet.englishContent = line.substring(4).trim()
    } 
    else if (line.startsWith('[CN]')) {
      currentTweet.chineseTranslation = line.substring(4).trim()
    }
    else if (line.startsWith('[TAGS]')) {
      const tagsText = line.substring(6).trim()
      currentTweet.tags = tagsText.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.trim())
    }
    else if (line.startsWith('[IMG]')) {
      currentTweet.imagePrompt = line.substring(5).trim()
    }
    else if (line.startsWith('[TIME]')) {
      // 解析时间标签
      const timeText = line.substring(6).trim()
      currentTweet.scheduledTime = timeText
    }
    else if (line.startsWith('[END]')) {
      // 一条推文结束，添加到列表
      if (currentTweet.englishContent) {
        tweets.push({...currentTweet})
      }
      currentTweet = {}
    }
  }
  
  // 处理最后一条推文（如果没有[END]结尾）
  if (currentTweet.englishContent && Object.keys(currentTweet).length > 0) {
    tweets.push(currentTweet)
  }
  
  return tweets
}

// 测试函数
function runTests() {
  let passedTests = 0;
  let totalTests = 0;

  testData.forEach((test, index) => {
    console.log(`\n--- 测试 ${index + 1}: ${test.name} ---`);
    totalTests++;
    
    try {
      const result = parseTextToTweets(test.input);
      
      if (Array.isArray(test.expected)) {
        // 多推文测试
        if (result.length === test.expected.length) {
          let allMatch = true;
          for (let i = 0; i < result.length; i++) {
            const expected = test.expected[i];
            const actual = result[i];
            
            if (!compareTweetData(actual, expected)) {
              allMatch = false;
              console.log(`❌ 推文 ${i + 1} 不匹配:`);
              console.log(`   期望:`, expected);
              console.log(`   实际:`, actual);
            }
          }
          
          if (allMatch) {
            console.log('✅ 多推文解析成功');
            passedTests++;
          }
        } else {
          console.log(`❌ 推文数量不匹配: 期望 ${test.expected.length}, 实际 ${result.length}`);
        }
      } else {
        // 单推文测试
        if (result.length === 1 && compareTweetData(result[0], test.expected)) {
          console.log('✅ 单推文解析成功');
          passedTests++;
        } else {
          console.log('❌ 推文解析失败:');
          console.log('   期望:', test.expected);
          console.log('   实际:', result);
        }
      }
    } catch (error) {
      console.log('❌ 测试执行错误:', error.message);
    }
  });

  console.log(`\n=== 测试结果 ===`);
  console.log(`通过: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
}

// 比较推文数据
function compareTweetData(actual, expected) {
  return (
    actual.englishContent === expected.englishContent &&
    actual.chineseTranslation === expected.chineseTranslation &&
    JSON.stringify(actual.tags) === JSON.stringify(expected.tags) &&
    actual.imagePrompt === expected.imagePrompt &&
    actual.scheduledTime === expected.scheduledTime
  );
}

// 运行测试
runTests();

// 生成CSV模板示例
console.log('\n=== CSV模板示例 ===');
const csvTemplate = `english_content,chinese_translation,tags,image_prompt,scheduled_time
"We are excited to announce our new feature!","我们很高兴宣布我们的新功能！","#crypto #blockchain #newfeature","A modern interface with glowing elements","2024-01-15T10:00:00Z"
"Join our AMA session tomorrow","明天加入我们的AMA会话","#AMA #community #crypto","A group of people in a virtual meeting","2024-01-16T15:00:00Z"`;

console.log('CSV格式:');
console.log(csvTemplate);

// 保存CSV模板文件
const csvPath = path.join(__dirname, 'twitter_template_with_time.csv');
fs.writeFileSync(csvPath, csvTemplate);
console.log(`\nCSV模板已保存到: ${csvPath}`);

console.log('\n=== 使用说明 ===');
console.log('1. 在批量上传中使用 [TIME] 标签设置计划发布时间');
console.log('2. 时间格式: ISO 8601 (如: 2024-01-15T10:00:00Z)');
console.log('3. 有时间的推文会自动设置为"已计划"状态');
console.log('4. 无时间的推文保持"草稿"状态');
console.log('5. 支持CSV文件导入，包含 scheduled_time 列'); 