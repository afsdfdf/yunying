const cloudinary = require('cloudinary').v2;

// 测试Cloudinary连接
async function testCloudinaryConnection() {
  console.log('☁️ 测试Cloudinary连接...\n');
  
  try {
    // 配置Cloudinary
    cloudinary.config({
      cloud_name: 'druoxjenv',
      api_key: '597294163335814',
      api_secret: 'aImqDgYU0bbb2_CyzkZ6_mZ5L4U'
    });
    
    console.log('✅ Cloudinary配置完成');
    console.log('   Cloud Name: druoxjenv');
    console.log('   API Key: 597294163335814');
    console.log('   API Secret: aImqDgYU0bbb2_CyzkZ6_mZ5L4U\n');
    
    // 测试连接 - 获取账户信息
    console.log('🔗 测试Cloudinary连接...');
    const accountInfo = await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('✅ Cloudinary连接成功！');
    console.log('📊 账户信息:', accountInfo);
    
    // 测试上传功能
    console.log('\n📤 测试图片上传功能...');
    
    // 创建一个简单的测试图片（1x1像素的PNG）
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
    
    const base64Image = testImageBuffer.toString('base64');
    const base64ImageWithPrefix = `data:image/png;base64,${base64Image}`;
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64ImageWithPrefix,
        {
          folder: 'yunying',
          resource_type: 'auto',
          public_id: `test-${Date.now()}`
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    console.log('✅ 图片上传成功！');
    console.log('📊 上传结果:');
    console.log(`   - Public ID: ${uploadResult.public_id}`);
    console.log(`   - URL: ${uploadResult.secure_url}`);
    console.log(`   - 尺寸: ${uploadResult.width}x${uploadResult.height}`);
    console.log(`   - 格式: ${uploadResult.format}`);
    console.log(`   - 文件大小: ${uploadResult.bytes} bytes`);
    
    // 删除测试图片
    console.log('\n🗑️ 清理测试图片...');
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(uploadResult.public_id, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('✅ 测试图片已删除');
    console.log('\n🎉 Cloudinary连接测试完成！');
    console.log('✅ 所有功能正常工作');
    
    return true;
    
  } catch (error) {
    console.error('❌ Cloudinary测试失败:', error.message);
    console.error('详细错误:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testCloudinaryConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testCloudinaryConnection }; 