-- 增强images表结构，添加分类、标签等字段
-- 这个脚本为images表添加缺失的字段以支持完整的图片管理功能

-- 添加category字段到images表
ALTER TABLE images ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 添加tags字段到images表
ALTER TABLE images ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 添加updated_at字段到images表
ALTER TABLE images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 添加description字段到images表
ALTER TABLE images ADD COLUMN IF NOT EXISTS description TEXT;

-- 添加alt_text字段到images表（用于SEO和无障碍访问）
ALTER TABLE images ADD COLUMN IF NOT EXISTS alt_text VARCHAR(500);

-- 添加is_public字段到images表（控制图片访问权限）
ALTER TABLE images ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 添加storage_provider字段到images表（记录存储服务提供商）
ALTER TABLE images ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'cloudinary';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_updated_at ON images(updated_at);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_storage_provider ON images(storage_provider);

-- 为images表添加updated_at触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_images_updated_at' 
        AND tgrelid = 'images'::regclass
    ) THEN
        CREATE TRIGGER update_images_updated_at 
            BEFORE UPDATE ON images 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 创建图片分类枚举类型（可选）
DO $$ BEGIN
    CREATE TYPE image_category AS ENUM (
        'logo', 'banner', 'social', 'tutorial', 'marketing', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建图片管理相关的函数

-- 函数：根据标签搜索图片
CREATE OR REPLACE FUNCTION search_images_by_tags(search_tags TEXT[])
RETURNS TABLE (
    id UUID,
    filename VARCHAR(255),
    original_name VARCHAR(255),
    blob_url TEXT,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.filename,
        i.original_name,
        i.blob_url,
        i.category,
        i.tags,
        i.created_at
    FROM images i
    WHERE i.tags && search_tags  -- 使用数组重叠操作符
    ORDER BY i.created_at DESC;
END;
$$;

-- 函数：获取图片统计信息
CREATE OR REPLACE FUNCTION get_image_stats(project_id_param UUID)
RETURNS TABLE (
    total_count BIGINT,
    total_size BIGINT,
    category_counts JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_count,
        COALESCE(SUM(file_size), 0)::BIGINT as total_size,
        jsonb_object_agg(
            COALESCE(category, 'uncategorized'), 
            category_count
        ) as category_counts
    FROM (
        SELECT 
            category,
            COUNT(*) as category_count
        FROM images 
        WHERE project_id = project_id_param
        GROUP BY category
    ) category_stats
    CROSS JOIN (
        SELECT COUNT(*) as total_count, SUM(file_size) as total_size
        FROM images 
        WHERE project_id = project_id_param
    ) totals;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION search_images_by_tags(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION search_images_by_tags(TEXT[]) TO service_role;
GRANT EXECUTE ON FUNCTION get_image_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_stats(UUID) TO service_role;

-- 更新现有数据（如果有的话）
UPDATE images 
SET category = 'other' 
WHERE category IS NULL;

UPDATE images 
SET tags = '{}' 
WHERE tags IS NULL;

-- 创建图片标签表（用于标签管理）
CREATE TABLE IF NOT EXISTS image_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- 默认蓝色
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为image_tags表添加updated_at触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_image_tags_updated_at' 
        AND tgrelid = 'image_tags'::regclass
    ) THEN
        CREATE TRIGGER update_image_tags_updated_at 
            BEFORE UPDATE ON image_tags 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 插入一些默认标签
INSERT INTO image_tags (name, color, description) VALUES
    ('logo', '#10B981', '项目Logo图片'),
    ('banner', '#F59E0B', '横幅和封面图片'),
    ('social', '#8B5CF6', '社交媒体素材'),
    ('tutorial', '#06B6D4', '教程和说明图片'),
    ('marketing', '#EF4444', '营销推广素材'),
    ('ui', '#6B7280', '用户界面元素'),
    ('icon', '#84CC16', '图标和按钮'),
    ('screenshot', '#F97316', '截图和演示')
ON CONFLICT (name) DO NOTHING; 