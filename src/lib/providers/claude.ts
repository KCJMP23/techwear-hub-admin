import Anthropic from '@anthropic-ai/sdk';
import { 
  AIContentGenerationRequest, 
  AIContentGenerationResponse 
} from '@affiliate-template/shared-types';
import { aiConfig } from '../config';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = aiConfig.claude.apiKey;
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }
    
    this.client = new Anthropic({
      apiKey,
      baseURL: aiConfig.claude.baseUrl,
    });
  }

  async generateContent(request: AIContentGenerationRequest): Promise<AIContentGenerationResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await this.client.messages.create({
        model: aiConfig.claude.defaultModel,
        max_tokens: this.getMaxTokens(request.length),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0]?.text;
      if (!content) {
        throw new Error('No content generated from Claude');
      }

      return {
        content,
        provider: 'claude',
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
        metadata: {
          model: response.model,
          temperature: 0.7,
          maxTokens: this.getMaxTokens(request.length),
        },
      };
    } catch (error) {
      throw new Error(`Claude content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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