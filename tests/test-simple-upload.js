const fs = require('fs');
const path = require('path');

// 简单的图片上传测试
async function testSimpleUpload() {
  console.log('🧪 测试简单图片上传...\n');
  
  try {
    // 创建一个测试图片文件（1x1像素的PNG）
    const testImagePath = path.join(__dirname, 'test-simple.png');
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('✅ 创建测试图片文件');
    
    // 读取文件内容
    const fileContent = fs.readFileSync(testImagePath);
    
    // 创建FormData（使用原生方式）
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const formData = [];
    
    // 添加文件
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="file"; filename="test-simple.png"');
    formData.push('Content-Type: image/png');
    formData.push('');
    formData.push(fileContent.toString('binary'));
    
    // 添加项目ID
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="projectId"');
    formData.push('');
    formData.push('c87cca9f-f315-427b-8306-f543b8331e0c');
    
    // 添加分类
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="category"');
    formData.push('');
    formData.push('test');
    
    // 添加标签
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="tags"');
    formData.push('');
    formData.push('["test","simple"]');
    
    // 结束边界
    formData.push(`--${boundary}--`);
    formData.push('');
    
    const body = formData.join('\r\n');
    
    console.log('📤 开始上传图片...');
    
    // 发送请求到图片上传API
    const response = await fetch('http://localhost:3000/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 图片上传成功！');
    console.log('📊 上传结果:');
    console.log(`   - 文件名: ${result.image.filename}`);
    console.log(`   - 原始名称: ${result.image.original_name}`);
    console.log(`   - 文件大小: ${result.image.file_size} bytes`);
    console.log(`   - 图片URL: ${result.image.blob_url}`);
    console.log(`   - 尺寸: ${result.image.width}x${result.image.height}`);
    console.log(`   - 分类: ${result.image.category}`);
    console.log(`   - 标签: ${JSON.stringify(result.image.tags)}`);
    
    // 清理测试文件
    fs.unlinkSync(testImagePath);
    console.log('🧹 清理测试文件');
    
    console.log('\n🎉 简单图片上传测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 简单图片上传测试失败:', error.message);
    
    // 清理测试文件（如果存在）
    const testImagePath = path.join(__dirname, 'test-simple.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSimpleUpload().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSimpleUpload }; 