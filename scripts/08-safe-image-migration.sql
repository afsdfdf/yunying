-- 安全的图片表迁移脚本
-- 这个脚本可以安全地重复执行，不会因为对象已存在而报错

-- 1. 添加字段（如果不存在）
DO $$
BEGIN
    -- 添加category字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'category'
    ) THEN
        ALTER TABLE images ADD COLUMN category VARCHAR(100);
    END IF;
    
    -- 添加tags字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'tags'
    ) THEN
        ALTER TABLE images ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- 添加updated_at字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- 添加description字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'description'
    ) THEN
        ALTER TABLE images ADD COLUMN description TEXT;
    END IF;
    
    -- 添加alt_text字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'alt_text'
    ) THEN
        ALTER TABLE images ADD COLUMN alt_text VARCHAR(500);
    END IF;
    
    -- 添加is_public字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE images ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    -- 添加storage_provider字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'images' AND column_name = 'storage_provider'
    ) THEN
        ALTER TABLE images ADD COLUMN storage_provider VARCHAR(50) DEFAULT 'cloudinary';
    END IF;
END $$;

-- 2. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_updated_at ON images(updated_at);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_storage_provider ON images(storage_provider);

-- 3. 创建触发器（如果不存在）
DO $$
BEGIN
    -- 检查update_updated_at_column函数是否存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        -- 创建函数
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    END IF;
    
    -- 为images表添加触发器
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

-- 4. 创建图片标签表（如果不存在）
CREATE TABLE IF NOT EXISTS image_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为image_tags表添加触发器（如果不存在）
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

-- 5. 创建函数（如果不存在）
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
    WHERE i.tags && search_tags
    ORDER BY i.created_at DESC;
END;
$$;

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

-- 6. 授予权限
GRANT EXECUTE ON FUNCTION search_images_by_tags(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION search_images_by_tags(TEXT[]) TO service_role;
GRANT EXECUTE ON FUNCTION get_image_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_stats(UUID) TO service_role;

-- 7. 更新现有数据
UPDATE images SET category = 'other' WHERE category IS NULL;
UPDATE images SET tags = '{}' WHERE tags IS NULL;

-- 8. 插入默认标签
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

-- 9. 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '图片表迁移完成！';
    RAISE NOTICE '已添加的字段: category, tags, updated_at, description, alt_text, is_public, storage_provider';
    RAISE NOTICE '已创建的索引: idx_images_category, idx_images_tags, idx_images_created_at, idx_images_updated_at, idx_images_is_public, idx_images_storage_provider';
    RAISE NOTICE '已创建的触发器: update_images_updated_at, update_image_tags_updated_at';
    RAISE NOTICE '已创建的函数: search_images_by_tags, get_image_stats';
    RAISE NOTICE '已创建的表: image_tags';
END $$; 