# 故障排除指南

## 图片上传问题

### 问题：无法上传图片

#### 1. 检查环境变量配置

确保 `.env.local` 文件中包含以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary配置
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 2. 运行数据库迁移

确保已执行图片表增强脚本：

```sql
-- 在Supabase SQL编辑器中执行
-- scripts/07-enhance-images-table.sql
```

#### 3. 检查Cloudinary账户

1. 登录 [Cloudinary控制台](https://cloudinary.com/console)
2. 获取你的 Cloud Name、API Key 和 API Secret
3. 确保账户有足够的存储空间

#### 4. 运行测试脚本

```bash
node tests/test-image-upload.js
```

#### 5. 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 和 Network 标签页
3. 尝试上传图片，查看错误信息

### 常见错误及解决方案

#### 错误：Cloudinary配置缺失
```
Cloudinary配置缺失，请检查环境变量
```

**解决方案**：
- 检查 `.env.local` 文件中的 Cloudinary 配置
- 确保环境变量名称正确
- 重启开发服务器

#### 错误：数据库连接失败
```
数据库连接失败: [错误信息]
```

**解决方案**：
- 检查 Supabase 配置
- 确保网络连接正常
- 验证 Supabase 项目状态

#### 错误：文件上传失败
```
上传失败: [错误信息]
```

**解决方案**：
- 检查文件大小（最大10MB）
- 确保文件格式支持（JPG, PNG, GIF）
- 检查网络连接

### 调试步骤

1. **检查环境变量**：
   ```bash
   node tests/test-image-upload.js
   ```

2. **检查数据库表结构**：
   ```sql
   -- 在Supabase中执行
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'images';
   ```

3. **检查API端点**：
   - 访问 `http://localhost:3000/api/images?projectId=your_project_id`
   - 应该返回图片列表或错误信息

4. **检查浏览器网络请求**：
   - 打开开发者工具
   - 查看 Network 标签页
   - 尝试上传图片，查看请求详情

### 联系支持

如果问题仍然存在，请提供以下信息：

1. 错误信息截图
2. 浏览器控制台日志
3. 环境变量配置（隐藏敏感信息）
4. 数据库表结构查询结果

### 临时解决方案

如果图片上传功能暂时无法使用，可以：

1. 使用外部图片链接
2. 手动上传图片到 Cloudinary
3. 使用其他图片存储服务 