import { NextRequest, NextResponse } from 'next/server';
import { groqService, ContentGenerationRequest, ContentPlanRequest } from '@/lib/groq-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'tweets':
        const tweetRequest: ContentGenerationRequest = {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          contentType: data.contentType,
          platform: 'twitter',
          topics: data.topics || [],
          tone: data.tone || 'professional',
          language: data.language || 'english',
          count: data.count || 10,
          includeTranslation: data.includeTranslation || false,
          includeImagePrompt: data.includeImagePrompt || false,
        };
        
        const tweets = await groqService.generateTweets(tweetRequest);
        return NextResponse.json({ success: true, data: tweets });

      case 'telegram':
        const telegramRequest: ContentGenerationRequest = {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          contentType: data.contentType,
          platform: 'telegram',
          topics: data.topics || [],
          tone: data.tone || 'professional',
          language: data.language || 'english',
          count: data.count || 10,
          includeTranslation: data.includeTranslation || false,
          includeImagePrompt: data.includeImagePrompt || false,
        };
        
        const telegramPosts = await groqService.generateTelegramPosts(telegramRequest);
        return NextResponse.json({ success: true, data: telegramPosts });

      case 'content-plan':
        const planRequest: ContentPlanRequest = {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          contentType: data.contentType,
          platform: data.platform,
          topics: data.topics || [],
          tone: data.tone || 'professional',
          language: data.language || 'english',
          count: data.count || 10,
          includeTranslation: data.includeTranslation || false,
          includeImagePrompt: data.includeImagePrompt || false,
          platforms: data.platforms || ['twitter', 'telegram'],
          contentTypes: data.contentTypes || ['announcement', 'education'],
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        };
        
        const contentPlan = await groqService.generateContentPlan(planRequest);
        return NextResponse.json({ success: true, data: contentPlan });

      case 'image-prompt':
        const imagePrompt = await groqService.generateImagePrompt(
          data.content,
          data.style || 'modern'
        );
        return NextResponse.json({ success: true, data: { imagePrompt } });

      case 'translate':
        const translation = await groqService.translateContent(
          data.content,
          data.targetLanguage || 'chinese'
        );
        return NextResponse.json({ success: true, data: { translation } });

      default:
        return NextResponse.json(
          { success: false, error: '不支持的内容生成类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '内容生成失败' },
      { status: 500 }
    );
  }
} 