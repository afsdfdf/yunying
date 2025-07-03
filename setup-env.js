/**
 * 环境变量设置助手
 * 
 * 此脚本帮助用户安全地设置环境变量，避免硬编码凭证
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 环境变量模板
const envTemplate = {
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase项目URL',
    example: 'https://your-project.supabase.co',
    required: true
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase匿名密钥',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase服务角色密钥',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true
  },
  BLOB_READ_WRITE_TOKEN: {
    description: 'Vercel Blob存储令牌',
    example: 'vercel_blob_rw_...',
    required: false
  },
  NEXT_PUBLIC_APP_URL: {
    description: '应用URL',
    example: 'http://localhost:3000',
    default: 'http://localhost:3000',
    required: false
  },
  ENABLE_STRICT_SECURITY: {
    description: '启用严格安全措施',
    example: 'true/false',
    default: 'false',
    required: false
  },
  LOG_LEVEL: {
    description: '日志级别',
    example: 'debug, info, warn, error',
    default: 'info',
    required: false
  }
};

// 提问函数
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 主函数
async function main() {
  console.log('=== 运营管理系统 - 环境变量设置助手 ===\n');
  console.log('此工具将帮助您设置必要的环境变量\n');
  
  // 检查是否已存在.env.local文件
  const envPath = path.join(process.cwd(), '.env.local');
  let existingEnv = {};
  
  if (fs.existsSync(envPath)) {
    console.log('检测到现有的.env.local文件。');
    const overwrite = await askQuestion('是否要覆盖现有设置? (y/n): ');
    
    if (overwrite.toLowerCase() !== 'y') {
      console.log('操作已取消。');
      rl.close();
      return;
    }
    
    // 读取现有的环境变量
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        if (key && value) {
          existingEnv[key.trim()] = value.trim();
        }
      }
    }
  }
  
  // 收集环境变量
  const envVars = {};
  
  for (const [key, config] of Object.entries(envTemplate)) {
    let value = '';
    
    // 如果已存在，使用现有值作为默认值
    const defaultValue = existingEnv[key] || config.default || '';
    const defaultPrompt = defaultValue ? ` (默认: ${defaultValue})` : '';
    
    if (config.required) {
      while (!value) {
        value = await askQuestion(`请输入${config.description}${defaultPrompt}: `);
        
        if (!value && defaultValue) {
          value = defaultValue;
        }
        
        if (!value) {
          console.log(`错误: ${config.description}是必需的。`);
        }
      }
    } else {
      value = await askQuestion(`请输入${config.description}${defaultPrompt} (可选): `);
      
      if (!value && defaultValue) {
        value = defaultValue;
      }
    }
    
    envVars[key] = value;
  }
  
  // 生成.env.local文件内容
  let envContent = '# 运营管理系统环境变量\n';
  envContent += '# 由setup-env.js自动生成\n\n';
  
  for (const [key, config] of Object.entries(envTemplate)) {
    envContent += `# ${config.description}\n`;
    envContent += `${key}=${envVars[key] || ''}\n\n`;
  }
  
  // 写入.env.local文件
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`\n环境变量已成功写入 ${envPath}`);
  } catch (error) {
    console.error('写入环境变量文件时出错:', error.message);
  }
  
  // 检查.gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('.env.local')) {
      const addToGitignore = await askQuestion('\n是否将.env.local添加到.gitignore? (y/n): ');
      
      if (addToGitignore.toLowerCase() === 'y') {
        gitignoreContent += '\n# 本地环境变量\n.env.local\n';
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('.env.local已添加到.gitignore');
      }
    } else {
      console.log('\n.env.local已在.gitignore中');
    }
  } else {
    const createGitignore = await askQuestion('\n未检测到.gitignore文件。是否创建并添加.env.local? (y/n): ');
    
    if (createGitignore.toLowerCase() === 'y') {
      fs.writeFileSync(gitignorePath, '# 本地环境变量\n.env.local\n');
      console.log('已创建.gitignore并添加.env.local');
    }
  }
  
  console.log('\n设置完成！您现在可以启动应用程序。');
  rl.close();
}

// 运行主函数
main().catch(error => {
  console.error('设置过程中发生错误:', error);
  rl.close();
}); 