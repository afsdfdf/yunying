const cloudinary = require('cloudinary').v2;
const { saveImageToDatabase } = require('../lib/database.ts');

// 直接测试图片上传功能（绕过FormData）
async function testImageApiDirect() {
  console.log('🧪 直接测试图片上传功能...\n');
  
  try {
    // 配置Cloudinary
    cloudinary.config({
      cloud_name: 'druoxjenv',
      api_key: '597294163335814',
      api_secret: 'aImqDgYU0bbb2_CyzkZ6_mZ5L4U'
    });
    
    console.log('✅ Cloudinary配置完成');
    
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
    
    console.log('📤 上传图片到Cloudinary...');
    
    // 上传到Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64ImageWithPrefix,
        {
          folder: 'yunying',
          resource_type: 'auto',
          public_id: `test-direct-${Date.now()}`
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
    
    console.log('✅ Cloudinary上传成功！');
    console.log(`   - Public ID: ${uploadResult.public_id}`);
    console.log(`   - URL: ${uploadResult.secure_url}`);
    console.log(`   - 尺寸: ${uploadResult.width}x${uploadResult.height}`);
    console.log(`   - 格式: ${uploadResult.format}`);
    console.log(`   - 文件大小: ${uploadResult.bytes} bytes`);
    
    console.log('\n💾 保存图片元数据到数据库...');
    
    // 保存图片元数据到数据库
    const imageData = {
      filename: uploadResult.public_id,
      original_name: 'test-direct.png',
      file_size: uploadResult.bytes,
      mime_type: 'image/png',
      blob_url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      project_id: 'c87cca9f-f315-427b-8306-f543b8331e0c',
      category: 'test',
      tags: ['test', 'direct', 'api']
    };
    
    const savedImage = await saveImageToDatabase(imageData);
    
    console.log('✅ 数据库保存成功！');
    console.log('📊 保存结果:');
    console.log(`   - 数据库ID: ${savedImage.id}`);
    console.log(`   - 文件名: ${savedImage.filename}`);
    console.log(`   - 原始名称: ${savedImage.original_name}`);
    console.log(`   - 文件大小: ${savedImage.file_size} bytes`);
    console.log(`   - 图片URL: ${savedImage.blob_url}`);
    console.log(`   - 尺寸: ${savedImage.width}x${savedImage.height}`);
    console.log(`   - 分类: ${savedImage.category}`);
    console.log(`   - 标签: ${JSON.stringify(savedImage.tags)}`);
    console.log(`   - 存储提供商: ${savedImage.storage_provider}`);
    
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
    console.log('\n🎉 直接图片上传测试完成！');
    console.log('✅ 所有功能正常工作');
    
    return true;
    
  } catch (error) {
    console.error('❌ 直接图片上传测试失败:', error.message);
    console.error('详细错误:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testImageApiDirect().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testImageApiDirect }; 