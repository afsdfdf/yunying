-- Add meta and tags columns to twitter_posts table
-- This script adds the missing columns for storing Chinese translations and image prompts

-- Add meta column to twitter_posts table
ALTER TABLE twitter_posts ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';

-- Add tags column to twitter_posts table  
ALTER TABLE twitter_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add target engagement columns to twitter_posts table
ALTER TABLE twitter_posts ADD COLUMN IF NOT EXISTS target_likes INTEGER;
ALTER TABLE twitter_posts ADD COLUMN IF NOT EXISTS target_retweets INTEGER;
ALTER TABLE twitter_posts ADD COLUMN IF NOT EXISTS target_replies INTEGER;

-- Add meta column to telegram_posts table
ALTER TABLE telegram_posts ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';

-- Add tags column to telegram_posts table
ALTER TABLE telegram_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_twitter_posts_meta ON twitter_posts USING GIN (meta);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_tags ON twitter_posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_telegram_posts_meta ON telegram_posts USING GIN (meta);
CREATE INDEX IF NOT EXISTS idx_telegram_posts_tags ON telegram_posts USING GIN (tags);

-- Update existing posts to have proper meta structure
UPDATE twitter_posts 
SET meta = jsonb_build_object(
  'english_content', content,
  'chinese_translation', '',
  'image_prompt', ''
)
WHERE meta IS NULL OR meta = '{}';

UPDATE telegram_posts 
SET meta = jsonb_build_object(
  'english_content', content,
  'chinese_translation', '',
  'image_prompt', ''
)
WHERE meta IS NULL OR meta = '{}';

-- Create a function to process tweet tags
CREATE OR REPLACE FUNCTION process_tweet_tags(tweet_id UUID, tags_string TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the tags column with the provided tags
  UPDATE twitter_posts 
  SET tags = string_to_array(tags_string, ' ')
  WHERE id = tweet_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_tweet_tags(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_tweet_tags(UUID, TEXT) TO service_role; 