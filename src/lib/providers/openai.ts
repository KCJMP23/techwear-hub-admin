import OpenAI from 'openai';
import { 
  AIContentGenerationRequest, 
  AIContentGenerationResponse, 
  ImageGenerationRequest, 
  ImageGenerationResponse 
} from '@affiliate-template/shared-types';
import { aiConfig } from '../config';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = aiConfig.openai.apiKey;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.client = new OpenAI({
      apiKey,
      baseURL: aiConfig.openai.baseUrl,
    });
  }

  async generateContent(request: AIContentGenerationRequest): Promise<AIContentGenerationResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await this.client.chat.completions.create({
        model: aiConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: this.getMaxTokens(request.length),
        stream: false,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      return {
        content,
        provider: 'openai',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        metadata: {
          model: response.model,
          temperature: 0.7,
          maxTokens: this.getMaxTokens(request.length),
        },
      };
    } catch (error) {
      throw new Error(`OpenAI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image generated from OpenAI');
      }

      return {
        imageUrl,
        provider: 'openai',
        generationId: response.data?.[0]?.revised_prompt || '',
        metadata: {
          model: 'dall-e-3',
          size: request.size || '1024x1024',
          style: request.style,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSystemPrompt(request: AIContentGenerationRequest): string {
    const tone = request.tone || 'professional';
    const length = request.length || 'medium';
    
    return `You are an expert content writer specializing in product reviews and recommendations. 
    
Your task is to create high-quality, engaging content that:
- Is written in a ${tone} tone
- Has a ${length} length
- Includes relevant keywords naturally
- Provides value to readers
- Is optimized for SEO
- Follows FTC guidelines for affiliate relationships

Always disclose affiliate relationships and provide honest, unbiased reviews.`;
  }

  private buildUserPrompt(request: AIContentGenerationRequest): string {
    const parts = [
      `Topic: ${request.prompt}`,
      request.targetAudience ? `Target Audience: ${request.targetAudience}` : '',
      request.keywords?.length ? `Keywords to include: ${request.keywords.join(', ')}` : '',
    ].filter(Boolean);

    return parts.join('\n\n');
  }

  private getMaxTokens(length?: string): number {
    switch (length) {
      case 'short':
        return 500;
      case 'long':
        return 2000;
      default:
        return 1000;
    }
  }
} 