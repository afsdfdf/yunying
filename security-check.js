/**
 * 安全检查脚本
 * 
 * 此脚本用于检测代码库中的安全问题，包括：
 * 1. 硬编码的API密钥和凭证
 * 2. 明文密码
 * 3. 敏感信息泄露
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// 定义要检查的模式
const securityPatterns = [
  {
    name: 'Supabase URL',
    pattern: /https:\/\/[a-z0-9-]+\.supabase\.co/gi,
    severity: 'HIGH',
  },
  {
    name: 'Supabase Key',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi,
    severity: 'CRITICAL',
  },
  {
    name: 'Email Address',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    severity: 'MEDIUM',
  },
  {
    name: 'Password',
    pattern: /(password|passwd|pwd)\s*[=:]\s*["']([^"']+)["']/gi,
    severity: 'HIGH',
  },
  {
    name: 'API Key Pattern',
    pattern: /(api[_-]?key|apikey|token|secret)[=:]\s*["']([a-zA-Z0-9_\-\.]+)["']/gi,
    severity: 'HIGH',
  },
  {
    name: 'Connection String',
    pattern: /(postgres|mysql|mongodb):\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_]+@[a-zA-Z0-9_.-]+/gi,
    severity: 'CRITICAL',
  },
];

// 要跳过的目录
const skipDirectories = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'tests',
];

// 要检查的文件扩展名
const fileExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.bat',
  '.sh',
  '.env',
];

// 收集所有文件
async function collectFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      if (!skipDirectories.includes(file)) {
        await collectFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (fileExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// 检查单个文件
async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of securityPatterns) {
      const matches = content.match(pattern.pattern);
      
      if (matches && matches.length > 0) {
        // 获取每个匹配的行号
        const lines = content.split('\n');
        const matchPositions = [];
        
        for (const match of matches) {
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(match)) {
              matchPositions.push({
                line: i + 1,
                content: lines[i].trim(),
                match: match,
              });
            }
          }
        }
        
        issues.push({
          type: pattern.name,
          severity: pattern.severity,
          matches: matchPositions,
        });
      }
    }
    
    if (issues.length > 0) {
      return { filePath, issues };
    }
    
    return null;
  } catch (error) {
    console.error(`检查文件 ${filePath} 时出错:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('=== 运营管理系统 - 安全检查工具 ===\n');
  console.log('正在扫描代码库中的安全问题...\n');
  
  try {
    // 收集所有文件
    const files = await collectFiles('.');
    console.log(`找到 ${files.length} 个文件需要检查\n`);
    
    // 检查每个文件
    const results = [];
    let processedFiles = 0;
    
    for (const file of files) {
      const result = await checkFile(file);
      if (result) {
        results.push(result);
      }
      
      processedFiles++;
      if (processedFiles % 50 === 0) {
        console.log(`已处理 ${processedFiles}/${files.length} 个文件...`);
      }
    }
    
    // 输出结果
    console.log('\n=== 安全检查结果 ===\n');
    
    if (results.length === 0) {
      console.log('太好了！没有发现安全问题。');
    } else {
      console.log(`发现 ${results.length} 个文件存在潜在安全问题:\n`);
      
      // 按严重程度排序
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      
      results.sort((a, b) => {
        const aHighestSeverity = Math.min(...a.issues.map(issue => severityOrder[issue.severity]));
        const bHighestSeverity = Math.min(...b.issues.map(issue => severityOrder[issue.severity]));
        return aHighestSeverity - bHighestSeverity;
      });
      
      // 输出结果
      for (const result of results) {
        console.log(`文件: ${result.filePath}`);
        
        for (const issue of result.issues) {
          console.log(`  [${issue.severity}] ${issue.type} (${issue.matches.length} 处匹配)`);
          
          // 只显示前3个匹配，避免输出过多
          const displayMatches = issue.matches.slice(0, 3);
          for (const match of displayMatches) {
            console.log(`    - 第 ${match.line} 行: ${match.content.substring(0, 80)}${match.content.length > 80 ? '...' : ''}`);
          }
          
          if (issue.matches.length > 3) {
            console.log(`    ... 以及另外 ${issue.matches.length - 3} 处匹配`);
          }
        }
        
        console.log('');
      }
      
      // 输出安全建议
      console.log('=== 安全建议 ===\n');
      console.log('1. 移除所有硬编码的API密钥和凭证，改用环境变量');
      console.log('2. 创建一个.env.example文件作为环境变量模板，不包含实际值');
      console.log('3. 确保.env文件已添加到.gitignore');
      console.log('4. 使用安全的密码存储方式，避免明文存储密码');
      console.log('5. 检查并撤销已泄露的密钥，生成新的密钥');
      console.log('6. 实现适当的密码策略和安全措施');
    }
  } catch (error) {
    console.error('扫描过程中发生错误:', error);
  }
}

// 运行主函数
main().catch(console.error); 