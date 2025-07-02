-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('管理员', '拥有所有权限，可以管理用户和系统设置', '["项目创建", "用户管理", "数据导出", "系统设置", "推文发布", "数据查看", "权限管理"]'),
('运营人员', '负责日常运营工作，可以发布内容和查看数据', '["推文发布", "电报管理", "数据查看", "项目管理"]'),
('数据分析师', '专注于数据分析，只能查看和导出数据', '["数据查看", "数据导出"]');

-- Insert sample users
INSERT INTO users (name, email, role, status) VALUES
('张三', 'zhangsan@example.com', '管理员', 'active'),
('李四', 'lisi@example.com', '运营人员', 'active'),
('王五', 'wangwu@example.com', '数据分析师', 'active');

-- Insert sample projects
INSERT INTO projects (name, description, status, progress, website_url, twitter_handle, telegram_handle, created_by) VALUES
('DeFi Protocol Alpha', '创新的DeFi协议，提供去中心化借贷服务', 'active', 75, 'https://defi-alpha.com', '@defi_alpha', '@defi_alpha_official', (SELECT id FROM users WHERE email = 'zhangsan@example.com')),
('NFT Marketplace Beta', 'NFT交易平台，支持多链资产交易', 'planning', 30, 'https://nft-beta.com', '@nft_beta', '@nft_beta_official', (SELECT id FROM users WHERE email = 'zhangsan@example.com')),
('GameFi Platform', '游戏化DeFi平台，结合游戏和金融', 'active', 90, 'https://gamefi.com', '@gamefi_platform', '@gamefi_official', (SELECT id FROM users WHERE email = 'zhangsan@example.com'));

-- Insert project members
INSERT INTO project_members (project_id, user_id, role) 
SELECT p.id, u.id, 'admin'
FROM projects p, users u 
WHERE u.email = 'zhangsan@example.com';

INSERT INTO project_members (project_id, user_id, role) 
SELECT p.id, u.id, 'member'
FROM projects p, users u 
WHERE u.email = 'lisi@example.com' AND p.name IN ('DeFi Protocol Alpha', 'NFT Marketplace Beta');

-- Insert sample tasks
INSERT INTO tasks (project_id, title, description, priority, status, assigned_to, due_date, created_by) VALUES
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), '完成白皮书撰写', '撰写项目白皮书，包含技术架构和经济模型', 'high', 'in-progress', (SELECT id FROM users WHERE email = 'lisi@example.com'), '2024-01-15', (SELECT id FROM users WHERE email = 'zhangsan@example.com')),
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), '社交媒体账号设置', '创建和配置Twitter、Telegram等社交媒体账号', 'medium', 'completed', (SELECT id FROM users WHERE email = 'lisi@example.com'), '2024-01-10', (SELECT id FROM users WHERE email = 'zhangsan@example.com')),
((SELECT id FROM projects WHERE name = 'NFT Marketplace Beta'), '网站UI设计', '设计NFT市场的用户界面', 'high', 'pending', (SELECT id FROM users WHERE email = 'wangwu@example.com'), '2024-01-20', (SELECT id FROM users WHERE email = 'zhangsan@example.com'));

-- Insert sample Twitter posts
INSERT INTO twitter_posts (project_id, content, status, published_at, likes_count, retweets_count, replies_count, created_by) VALUES
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), '🚀 Exciting news! Our DeFi protocol is launching next week. Stay tuned for more updates! #DeFi #Crypto', 'published', NOW() - INTERVAL '2 hours', 45, 12, 8, (SELECT id FROM users WHERE email = 'lisi@example.com')),
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), '📊 Weekly market analysis: The DeFi space continues to grow with innovative solutions...', 'scheduled', NOW() + INTERVAL '5 days', 0, 0, 0, (SELECT id FROM users WHERE email = 'lisi@example.com')),
((SELECT id FROM projects WHERE name = 'GameFi Platform'), '🔥 Join our community and be part of the future of decentralized finance!', 'draft', NULL, 0, 0, 0, (SELECT id FROM users WHERE email = 'lisi@example.com'));

-- Insert sample Telegram posts
INSERT INTO telegram_posts (project_id, content, post_type, status, published_at, views_count, reactions_count, shares_count, created_by) VALUES
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), '🎉 Welcome to our official Telegram channel! Stay updated with the latest news and announcements about our DeFi protocol.', 'text', 'published', NOW() - INTERVAL '5 hours', 1250, 45, 12, (SELECT id FROM users WHERE email = 'lisi@example.com')),
((SELECT id FROM projects WHERE name = 'NFT Marketplace Beta'), '📈 Market Update: Our token has shown strong performance this week. Check out the detailed analysis in our latest blog post.', 'text_with_link', 'scheduled', NOW() + INTERVAL '3 days', 0, 0, 0, (SELECT id FROM users WHERE email = 'lisi@example.com')),
((SELECT id FROM projects WHERE name = 'GameFi Platform'), '🔥 AMA Session this Friday at 3 PM UTC! Join us to learn more about our upcoming features and roadmap.', 'announcement', 'draft', NULL, 0, 0, 0, (SELECT id FROM users WHERE email = 'lisi@example.com'));

-- Insert sample website analytics
INSERT INTO website_analytics (project_id, date, visits, unique_visitors, page_views, avg_session_duration) VALUES
((SELECT id FROM projects WHERE name = 'DeFi Protocol Alpha'), CURRENT_DATE - INTERVAL '1 day', 15847, 8234, 23456, 204),
((SELECT id FROM projects WHERE name = 'NFT Marketplace Beta'), CURRENT_DATE - INTERVAL '1 day', 9234, 5678, 14567, 165),
((SELECT id FROM projects WHERE name = 'GameFi Platform'), CURRENT_DATE - INTERVAL '1 day', 12456, 7890, 18234, 252);

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES
((SELECT id FROM users WHERE email = 'zhangsan@example.com'), '创建了新项目', 'project', '{"project_name": "DeFi Protocol Alpha"}'),
((SELECT id FROM users WHERE email = 'lisi@example.com'), '发布了推文', 'twitter_post', '{"content": "🚀 Exciting news!"}'),
((SELECT id FROM users WHERE email = 'wangwu@example.com'), '导出了数据报告', 'analytics', '{"report_type": "website_analytics"}'),
((SELECT id FROM users WHERE email = 'zhangsan@example.com'), '修改了用户权限', 'user', '{"target_user": "李四"}'),
((SELECT id FROM users WHERE email = 'lisi@example.com'), '登录系统', 'auth', '{"login_time": "2024-01-10 09:15"}');
