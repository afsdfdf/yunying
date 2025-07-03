// GROQ API服务 - 用于AI内容生成
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface ContentGenerationRequest {
  projectName: string;
  projectDescription: string;
  contentType: string;
  platform: string;
  topics: string[];
  tone: string;
  language: string;
  count: number;
  includeTranslation?: boolean;
  includeImagePrompt?: boolean;
}

export interface ContentPlanRequest extends ContentGenerationRequest {
  platforms: string[];
  contentTypes: string[];
  startDate: Date;
  endDate: Date;
}

export interface GeneratedContent {
  englishContent: string;
  chineseTranslation?: string;
  imagePrompt?: string;
  hashtags: string[];
  suggestedTime?: string;
}

export interface ContentPlan {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  platforms: string[];
  contentTypes: string[];
  topics: string[];
  generatedContent: GeneratedContent[];
}

class GroqService {
  private async makeRequest(prompt: string, systemPrompt?: string) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // 使用Llama3模型
          messages: [
            {
              role: 'system',
              content: systemPrompt || '你是一个专业的加密货币项目内容策划专家，擅长创建吸引人的社交媒体内容。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('GROQ API request failed:', error);
      throw error;
    }
  }

  // 生成推文内容
  async generateTweets(request: ContentGenerationRequest): Promise<GeneratedContent[]> {
    const prompt = `
请为加密货币项目"${request.projectName}"生成${request.count}条高质量的推文内容。

项目描述：${request.projectDescription}
内容类型：${request.contentType}
目标平台：${request.platform}
关键话题：${request.topics.join(', ')}
语调风格：${request.tone}
语言：${request.language}

要求：
1. 每条推文都要包含相关的加密货币标签
2. 内容要吸引人且符合平台特点
3. 如果指定了中文翻译，请提供英文原文和中文翻译
4. 如果指定了图片提示词，请为每条推文提供相关的图片生成提示词
5. 建议合适的发布时间（考虑时区）

请按以下JSON格式返回：
[
  {
    "englishContent": "英文推文内容",
    "chineseTranslation": "中文翻译（如果需要）",
    "imagePrompt": "图片提示词（如果需要）",
    "hashtags": ["#标签1", "#标签2"],
    "suggestedTime": "建议发布时间"
  }
]
`;

    const systemPrompt = `你是一个专业的加密货币项目内容策划专家。你需要：
1. 创建吸引人且专业的推文内容
2. 确保内容符合加密货币行业规范
3. 使用合适的标签和话题
4. 提供准确的中英文翻译
5. 生成相关的图片提示词
6. 建议合适的发布时间

请始终以JSON格式返回结果，确保格式正确。`;

    const response = await this.makeRequest(prompt, systemPrompt);
    
    try {
      // 尝试解析JSON响应
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      // 如果JSON解析失败，尝试提取内容
      console.warn('Failed to parse JSON response, attempting to extract content:', error);
      return this.extractContentFromText(response, request.count);
    }
  }

  // 生成Telegram帖子内容
  async generateTelegramPosts(request: ContentGenerationRequest): Promise<GeneratedContent[]> {
    const prompt = `
请为加密货币项目"${request.projectName}"生成${request.count}条高质量的Telegram帖子内容。

项目描述：${request.projectDescription}
内容类型：${request.contentType}
关键话题：${request.topics.join(', ')}
语调风格：${request.tone}
语言：${request.language}

要求：
1. Telegram帖子可以比推文更长，支持Markdown格式
2. 内容要详细且有价值
3. 使用适当的Markdown格式（粗体、斜体、列表等）
4. 如果指定了中文翻译，请提供英文原文和中文翻译
5. 如果指定了图片提示词，请为每条帖子提供相关的图片生成提示词
6. 建议合适的发布时间

请按以下JSON格式返回：
[
  {
    "englishContent": "英文帖子内容（支持Markdown）",
    "chineseTranslation": "中文翻译（如果需要）",
    "imagePrompt": "图片提示词（如果需要）",
    "hashtags": ["#标签1", "#标签2"],
    "suggestedTime": "建议发布时间"
  }
]
`;

    const systemPrompt = `你是一个专业的加密货币项目内容策划专家，特别擅长Telegram平台的内容创作。你需要：
1. 创建详细且有价值的Telegram帖子
2. 使用适当的Markdown格式增强可读性
3. 确保内容符合加密货币行业规范
4. 提供准确的中英文翻译
5. 生成相关的图片提示词
6. 建议合适的发布时间

请始终以JSON格式返回结果，确保格式正确。`;

    const response = await this.makeRequest(prompt, systemPrompt);
    
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.warn('Failed to parse JSON response, attempting to extract content:', error);
      return this.extractContentFromText(response, request.count);
    }
  }

  // 生成完整的内容策划方案
  async generateContentPlan(request: ContentPlanRequest): Promise<ContentPlan> {
    const prompt = `
请为加密货币项目"${request.projectName}"生成一个完整的内容策划方案。

项目描述：${request.projectDescription}
目标平台：${request.platforms.join(', ')}
内容类型：${request.contentTypes.join(', ')}
关键话题：${request.topics.join(', ')}
内容数量：${request.count}
策划周期：${request.startDate} 到 ${request.endDate}

请生成一个完整的内容策划方案，包括：
1. 策划标题和描述
2. 针对每个平台的内容建议
3. 内容发布时间安排
4. 关键话题和标签建议

请按以下JSON格式返回：
{
  "title": "策划标题",
  "description": "策划描述",
  "startDate": "开始日期",
  "endDate": "结束日期",
  "platforms": ["平台1", "平台2"],
  "contentTypes": ["类型1", "类型2"],
  "topics": ["话题1", "话题2"],
  "generatedContent": [
    {
      "englishContent": "内容",
      "chineseTranslation": "翻译",
      "imagePrompt": "图片提示词",
      "hashtags": ["#标签1"],
      "suggestedTime": "建议时间"
    }
  ]
}
`;

    const systemPrompt = `你是一个专业的加密货币项目内容策划专家。你需要：
1. 创建完整的内容策划方案
2. 考虑不同平台的特点和用户习惯
3. 合理安排内容发布时间
4. 确保内容的多样性和吸引力
5. 提供实用的建议和指导

请始终以JSON格式返回结果，确保格式正确。`;

    const response = await this.makeRequest(prompt, systemPrompt);
    
    try {
      const parsed = JSON.parse(response);
      return {
        id: `plan-${Date.now()}`,
        title: parsed.title || '内容策划方案',
        description: parsed.description || '',
        startDate: new Date(parsed.startDate || request.startDate),
        endDate: new Date(parsed.endDate || request.endDate),
        platforms: parsed.platforms || request.platforms,
        contentTypes: parsed.contentTypes || request.contentTypes,
        topics: parsed.topics || request.topics,
        generatedContent: parsed.generatedContent || []
      };
    } catch (error) {
      console.warn('Failed to parse content plan JSON:', error);
      throw new Error('无法解析内容策划方案');
    }
  }

  // 从文本中提取内容（备用方法）
  private extractContentFromText(text: string, count: number): GeneratedContent[] {
    const lines = text.split('\n').filter(line => line.trim());
    const contents: GeneratedContent[] = [];
    
    for (let i = 0; i < Math.min(count, lines.length); i++) {
      const line = lines[i];
      if (line.trim()) {
        contents.push({
          englishContent: line.trim(),
          chineseTranslation: '',
          imagePrompt: '',
          hashtags: ['#crypto', '#blockchain'],
          suggestedTime: ''
        });
      }
    }
    
    return contents;
  }

  // 生成图片提示词
  async generateImagePrompt(content: string, style: string = 'modern'): Promise<string> {
    const prompt = `
基于以下内容生成一个详细的图片提示词：

内容：${content}
风格：${style}

要求：
1. 生成适合AI图像生成的详细提示词
2. 包含视觉元素、颜色、构图等细节
3. 符合加密货币/区块链主题
4. 专业且吸引人

请直接返回图片提示词，不需要其他格式。`;

    const systemPrompt = `你是一个专业的AI图像提示词专家，擅长为加密货币相关内容生成高质量的图像提示词。`;

    return await this.makeRequest(prompt, systemPrompt);
  }

  // 翻译内容
  async translateContent(content: string, targetLanguage: string = 'chinese'): Promise<string> {
    const prompt = `
请将以下内容翻译成${targetLanguage}：

原文：${content}

要求：
1. 保持原文的语气和风格
2. 确保翻译准确且自然
3. 保留重要的专业术语
4. 适应目标语言的文化背景

请直接返回翻译结果，不需要其他格式。`;

    const systemPrompt = `你是一个专业的翻译专家，特别擅长加密货币和技术内容的翻译。`;

    return await this.makeRequest(prompt, systemPrompt);
  }
}

export const groqService = new GroqService(); 