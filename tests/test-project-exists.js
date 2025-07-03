// 使用内置的http模块
const http = require('http');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const BASE_URL = 'http://localhost:3000/api';

async function testProjectExists() {
  console.log('🔍 检查项目是否存在...\n');

  try {
    // 1. 获取项目列表
    console.log('1. 获取项目列表...');
    const projectsResponse = await fetch(`${BASE_URL}/projects`);
    const projectsData = await projectsResponse.json();
    
    if (!projectsResponse.ok) {
      throw new Error(`获取项目列表失败: ${projectsData.error}`);
    }
    
    console.log(`✅ 成功获取 ${projectsData.projects?.length || 0} 个项目`);
    
    if (!projectsData.projects || projectsData.projects.length === 0) {
      console.log('⚠️  没有找到项目，请先创建项目');
      return;
    }

    // 显示所有项目
    console.log('\n📋 项目列表:');
    projectsData.projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (ID: ${project.id})`);
    });

    const testProject = projectsData.projects[0];
    console.log(`\n🎯 测试项目: ${testProject.name} (ID: ${testProject.id})`);

    // 2. 测试获取项目详情
    console.log('\n2. 测试获取项目详情...');
    const getResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`);
    
    console.log(`   响应状态: ${getResponse.status}`);
    console.log(`   响应头: ${JSON.stringify(Object.fromEntries(getResponse.headers.entries()))}`);
    
    const getData = await getResponse.json();
    console.log(`   响应数据: ${JSON.stringify(getData, null, 2)}`);
    
    if (!getResponse.ok) {
      console.log(`❌ 获取项目详情失败: ${getData.error}`);
      console.log(`   错误详情: ${getData.details || '无详细信息'}`);
    } else {
      console.log('✅ 成功获取项目详情');
      console.log(`   项目名称: ${getData.project.name}`);
      console.log(`   项目状态: ${getData.project.status}`);
    }

    // 3. 测试不同的项目ID格式
    console.log('\n3. 测试不同的项目ID格式...');
    
    // 测试UUID格式
    console.log(`   测试UUID格式: ${testProject.id}`);
    const uuidResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`);
    console.log(`   UUID格式响应: ${uuidResponse.status}`);
    
    // 测试项目名称
    console.log(`   测试项目名称: ${testProject.name}`);
    const nameResponse = await fetch(`${BASE_URL}/projects/${encodeURIComponent(testProject.name)}`);
    console.log(`   项目名称响应: ${nameResponse.status}`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testProjectExists().then(() => {
  console.log('\n🏁 测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 测试过程中发生错误:', error);
  process.exit(1);
}); 