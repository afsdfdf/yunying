/**
 * 临时文件和测试文件清理脚本
 * 
 * 此脚本用于整理项目中的临时文件和测试文件，将它们移动到适当的目录
 * 或根据需要删除它们。
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 定义要处理的文件类型
const testFiles = [
  'test-database-api.js',
  'test-login.js',
  'test-create-project.js',
  'test-db.js',
  'test-neon.js',
  'test-supabase-simple.js',
  'test-check-schema.js',
];

const batchFiles = [
  'init-db.bat',
  'init-manual.bat',
  'create-user.bat',
  'test-login.bat',
  'test-create-project.bat',
  'install-deps.bat',
];

const initScripts = [
  'init-database.js',
  'init-manual.js',
  'create-user.js',
  'fix-api-format.js',
];

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 确保目录存在
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`创建目录: ${directory}`);
  }
}

// 移动文件
function moveFile(source, destination) {
  try {
    // 确保目标目录存在
    const destDir = path.dirname(destination);
    ensureDirectoryExists(destDir);
    
    // 复制文件
    fs.copyFileSync(source, destination);
    
    // 删除源文件
    fs.unlinkSync(source);
    
    console.log(`已移动: ${source} -> ${destination}`);
    return true;
  } catch (error) {
    console.error(`移动文件失败 ${source}: ${error.message}`);
    return false;
  }
}

// 删除文件
function deleteFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log(`已删除: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`删除文件失败 ${filePath}: ${error.message}`);
    return false;
  }
}

// 检查文件是否存在
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// 主函数
async function main() {
  console.log('=== 运营管理系统 - 临时文件清理工具 ===');
  
  // 创建必要的目录
  ensureDirectoryExists('./tests');
  ensureDirectoryExists('./scripts/batch');
  ensureDirectoryExists('./scripts/init');
  
  // 处理测试文件
  console.log('\n处理测试文件...');
  for (const file of testFiles) {
    if (fileExists(file)) {
      const answer = await askQuestion(`是否将 ${file} 移动到 tests 目录? (y/n/d - 是/否/删除): `);
      
      if (answer.toLowerCase() === 'y') {
        moveFile(file, `./tests/${file}`);
      } else if (answer.toLowerCase() === 'd') {
        if (await askQuestion(`确定要删除 ${file}? (y/n): `) === 'y') {
          deleteFile(file);
        }
      }
    }
  }
  
  // 处理批处理文件
  console.log('\n处理批处理文件...');
  for (const file of batchFiles) {
    if (fileExists(file)) {
      const answer = await askQuestion(`是否将 ${file} 移动到 scripts/batch 目录? (y/n/d - 是/否/删除): `);
      
      if (answer.toLowerCase() === 'y') {
        moveFile(file, `./scripts/batch/${file}`);
      } else if (answer.toLowerCase() === 'd') {
        if (await askQuestion(`确定要删除 ${file}? (y/n): `) === 'y') {
          deleteFile(file);
        }
      }
    }
  }
  
  // 处理初始化脚本
  console.log('\n处理初始化脚本...');
  for (const file of initScripts) {
    if (fileExists(file)) {
      const answer = await askQuestion(`是否将 ${file} 移动到 scripts/init 目录? (y/n/d - 是/否/删除): `);
      
      if (answer.toLowerCase() === 'y') {
        moveFile(file, `./scripts/init/${file}`);
      } else if (answer.toLowerCase() === 'd') {
        if (await askQuestion(`确定要删除 ${file}? (y/n): `) === 'y') {
          deleteFile(file);
        }
      }
    }
  }
  
  console.log('\n清理完成!');
  rl.close();
}

// 提问函数
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 运行主函数
main().catch(error => {
  console.error('发生错误:', error);
  rl.close();
}); 