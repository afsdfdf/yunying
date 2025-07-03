const fs = require('fs');
const path = require('path');

// 测试图片上传功能
async function testImageUpload() {
  console.log('🧪 测试图片上传功能...\n');
  
  try {
    // 创建一个测试图片文件（1x1像素的PNG）
    const testImagePath = path.join(__dirname, 'test-image.png');
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
    
    // 创建FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    // 添加文件
    form.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // 添加其他字段
    form.append('projectId', '8a88f1a7-01a2-4a75-81ad-3836dfc256f5'); // 使用第一个项目
    form.append('category', 'test');
    form.append('tags', JSON.stringify(['test', 'upload']));
    
    console.log('📤 开始上传图片...');
    console.log('📋 FormData内容:');
    console.log('   - 文件: test-image.png');
    console.log('   - 项目ID: 8a88f1a7-01a2-4a75-81ad-3836dfc256f5');
    console.log('   - 分类: test');
    console.log('   - 标签: ["test", "upload"]');
    
    // 发送请求到图片上传API
    const response = await fetch('http://localhost:3000/api/images', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
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
    
    console.log('\n🎉 图片上传测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 图片上传测试失败:', error.message);
    
    // 清理测试文件（如果存在）
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testImageUpload().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testImageUpload }; 