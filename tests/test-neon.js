// 测试Neon数据库连接
const { neon } = require('@neondatabase/serverless');

// 使用与应用相同的连接信息
// 注意：这里使用一个示例URL，实际使用时应替换为正确的连接字符串
const DATABASE_URL = process.env.POSTGRES_URL || 'postgresql://user:password@hostname:5432/database';

async function testNeonConnection() {
  console.log('测试 Neon 数据库连接...');
  
  try {
    // 创建SQL客户端
    const sql = neon(DATABASE_URL);
    
    // 尝试简单查询
    console.log('执行测试查询...');
    const result = await sql`SELECT 1 as test`;
    
    console.log('查询成功:', result);
    
  } catch (err) {
    console.error('连接或查询错误:', err);
  }
}

testNeonConnection(); 