-- Enhanced database schema with better functionality

-- Add missing columns and constraints
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS token_symbol VARCHAR(10);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS token_contract TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS launch_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_supply BIGINT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS market_cap DECIMAL(20,2);

-- Enhanced user roles and permissions
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Social media account management
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'telegram', 'discord', 'medium'
    account_handle VARCHAR(255) NOT NULL,
    account_id VARCHAR(255), -- Platform-specific ID
    access_token TEXT, -- Encrypted access token
    refresh_token TEXT, -- Encrypted refresh token
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, platform, account_handle)
);

-- Content templates for reusable posts
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'announcement', 'update', 'marketing', 'community'
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Template variables like {project_name}, {date}
    platforms JSONB DEFAULT '[]', -- Which platforms this template is for
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled posts with better management
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    template_id UUID REFERENCES content_templates(id),
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed', 'cancelled'
    published_at TIMESTAMP WITH TIME ZONE,
    platform_post_id VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced analytics with more metrics
CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    reach_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, platform, date)
);

-- Content approval workflow
CREATE TABLE IF NOT EXISTS content_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID, -- Can reference twitter_posts, telegram_posts, or scheduled_posts
    post_type VARCHAR(50) NOT NULL, -- 'twitter', 'telegram', 'scheduled'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revision_requested'
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hashtag and keyword tracking
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    hashtag VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'brand', 'trending', 'community', 'technical'
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, hashtag)
);

-- Post hashtag relationships
CREATE TABLE IF NOT EXISTS post_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    post_type VARCHAR(50) NOT NULL, -- 'twitter', 'telegram'
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, post_type, hashtag_id)
);

-- Enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_project_platform ON social_accounts(project_id, platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_analytics_project_date ON social_analytics(project_id, date);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_hashtags_project ON hashtags(project_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post ON post_hashtags(post_id, post_type);

-- Update triggers for updated_at columns
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
