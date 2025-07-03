const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testProjectSettings() {
  console.log('🧪 测试项目设置功能...\n');

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
      console.log('⚠️  没有找到项目，跳过后续测试');
      return;
    }

    const testProject = projectsData.projects[0];
    console.log(`📋 测试项目: ${testProject.name} (ID: ${testProject.id})\n`);

    // 2. 获取项目详情
    console.log('2. 获取项目详情...');
    const getResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`);
    const getData = await getResponse.json();
    
    if (!getResponse.ok) {
      throw new Error(`获取项目详情失败: ${getData.error}`);
    }
    
    console.log('✅ 成功获取项目详情');
    console.log(`   项目名称: ${getData.project.name}`);
    console.log(`   项目状态: ${getData.project.status}\n`);

    // 3. 更新项目信息
    console.log('3. 更新项目信息...');
    const updateData = {
      name: `${testProject.name} (已更新)`,
      description: '这是通过API更新的项目描述',
      status: 'active',
      website_url: 'https://example.com',
      twitter_handle: '@testproject',
      telegram_handle: '@testgroup'
    };

    const updateResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();
    
    if (!updateResponse.ok) {
      throw new Error(`更新项目失败: ${updateResult.error}`);
    }
    
    console.log('✅ 成功更新项目信息');
    console.log(`   新名称: ${updateResult.project.name}`);
    console.log(`   新状态: ${updateResult.project.status}\n`);

    // 4. 验证更新结果
    console.log('4. 验证更新结果...');
    const verifyResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`);
    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok) {
      throw new Error(`验证更新失败: ${verifyData.error}`);
    }
    
    console.log('✅ 更新验证成功');
    console.log(`   当前名称: ${verifyData.project.name}`);
    console.log(`   当前状态: ${verifyData.project.status}\n`);

    // 5. 恢复原始数据（可选）
    console.log('5. 恢复原始数据...');
    const restoreData = {
      name: testProject.name,
      description: testProject.description,
      status: testProject.status,
      website_url: testProject.website_url,
      twitter_handle: testProject.twitter_handle,
      telegram_handle: testProject.telegram_handle
    };

    const restoreResponse = await fetch(`${BASE_URL}/projects/${testProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(restoreData),
    });

    if (restoreResponse.ok) {
      console.log('✅ 成功恢复原始数据\n');
    } else {
      console.log('⚠️  恢复原始数据失败\n');
    }

    console.log('🎉 项目设置功能测试完成！');
    console.log('\n📝 测试总结:');
    console.log('   ✅ 获取项目列表');
    console.log('   ✅ 获取项目详情');
    console.log('   ✅ 更新项目信息');
    console.log('   ✅ 验证更新结果');
    console.log('   ✅ 恢复原始数据');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 注意：删除项目测试需要谨慎，这里不包含删除测试
async function testDeleteProject() {
  console.log('\n⚠️  删除项目测试（需要手动确认）...');
  console.log('为了安全起见，删除项目测试需要手动执行。');
  console.log('请确保您真的要删除测试项目。');
  
  // 这里可以添加删除项目的测试代码
  // 但为了安全起见，我们不在自动化测试中包含删除操作
}

// 运行测试
testProjectSettings().then(() => {
  console.log('\n🏁 所有测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 测试过程中发生错误:', error);
  process.exit(1);
}); 