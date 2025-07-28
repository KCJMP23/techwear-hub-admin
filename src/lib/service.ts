import { 
  AIContentGenerationRequest, 
  AIContentGenerationResponse, 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  AIGenerationHistory 
} from '@affiliate-template/shared-types';
import { OpenAIService } from './providers/openai';
import { ClaudeService } from './providers/claude';
import { LeonardoService } from './providers/leonardo';

export interface BlogPostTemplate {
  type: 'how_to' | 'listicle' | 'product_review' | 'answer_post' | 'roundup' | 'alternate';
  title: string;
  structure: string[];
  wordCount: number;
  seoFocus: string[];
}

export interface AutoBlogRequest {
  siteId: string;
  niche: string;
  postType: BlogPostTemplate['type'];
  keywords: string[];
  targetAudience: string;
  affiliateLinks?: string[];
  internalLinks?: string[];
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  provider?: 'openai' | 'claude';
}

export class AIService {
  private openai: OpenAIService;
  private claude: ClaudeService;
  private leonardo: LeonardoService;

  // Blog post templates based on user's requirements
  private blogTemplates: Record<BlogPostTemplate['type'], BlogPostTemplate> = {
    how_to: {
      type: 'how_to',
      title: 'How-To Guide',
      structure: [
        'Introduction with problem statement',
        'Table of Contents with jump links',
        'Numbered subheadings (10-15 steps)',
        'Clear, concise paragraphs (10-year-old reading level)',
        'Supporting images and illustrations',
        'Short conclusion with call-to-action'
      ],
      wordCount: 3000,
      seoFocus: ['how to', 'guide', 'tutorial', 'step by step']
    },
    listicle: {
      type: 'listicle',
      title: 'Listicle Post',
      structure: [
        'Introduction explaining why they\'ve come to the right place',
        'Table of Contents with jump links',
        'Numbered items with "#1" subheadings',
        'Short, concise sections for each item with images',
        'Short takeaway and call-to-action'
      ],
      wordCount: 2500,
      seoFocus: ['best', 'top', 'list', 'review']
    },
    product_review: {
      type: 'product_review',
      title: 'Product Review',
      structure: [
        'Short intro with question format',
        'What is the product?',
        'My Experience section',
        'Supporting image of using the product',
        'Pros & Cons section',
        'Pricing information',
        'Bottom line tying it all together',
        'Recommendation section to other products',
        'Takeaway and call-to-action'
      ],
      wordCount: 2000,
      seoFocus: ['review', 'best', 'pros cons', 'pricing']
    },
    answer_post: {
      type: 'answer_post',
      title: 'Answer Post',
      structure: [
        'Direct answer to the question',
        'Introduction and detailed explanation',
        'Related questions and answers',
        'Takeaway and call-to-action'
      ],
      wordCount: 1800,
      seoFocus: ['what is', 'how to', 'guide', 'explanation']
    },
    roundup: {
      type: 'roundup',
      title: 'Roundup Post',
      structure: [
        'Short, concise intro',
        'Jump links table of contents',
        'Product 1: Experience, image, pros/cons, pricing, bottom line',
        'Product 2: Experience, image, pros/cons, pricing, bottom line',
        'Continue for all products',
        'Optional FAQs section',
        'Takeaway/call-to-action'
      ],
      wordCount: 4000,
      seoFocus: ['best', 'comparison', 'roundup', 'top']
    },
    alternate: {
      type: 'alternate',
      title: 'Alternative Post',
      structure: [
        'Introduction about alternatives',
        'Why consider alternatives',
        'Alternative 1: Why it\'s a great replacement',
        'Alternative 2: Why it\'s a great replacement',
        'Continue for all alternatives',
        'Comparison table',
        'Recommendation and call-to-action'
      ],
      wordCount: 2200,
      seoFocus: ['alternative', 'replacement', 'instead of', 'similar to']
    }
  };

  constructor() {
    this.openai = new OpenAIService();
    this.claude = new ClaudeService();
    this.leonardo = new LeonardoService();
  }

  async generateContent(request: AIContentGenerationRequest): Promise<AIContentGenerationResponse> {
    try {
      let response: AIContentGenerationResponse;

      switch (request.provider) {
        case 'openai':
          response = await this.openai.generateContent(request);
          break;
        case 'claude':
          response = await this.claude.generateContent(request);
          break;
        default:
          throw new Error(`Unsupported content generation provider: ${request.provider}`);
      }

      return response;
    } catch (error) {
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.leonardo.generateImage(request);
      return response;
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAutoBlogPost(request: AutoBlogRequest): Promise<{
    title: string;
    content: string;
    summary: string;
    keyTakeaways: string[];
    seoData: any;
    wordCount: number;
    readingTime: number;
  }> {
    const template = this.blogTemplates[request.postType];
    const provider = request.provider || 'openai';

    // Build comprehensive prompt based on template and user's blogging principles
    const prompt = this.buildAutoBlogPrompt(request, template);

    const aiRequest: AIContentGenerationRequest = {
      prompt,
      provider,
      contentType: 'blog_post',
      tone: request.tone || 'professional',
      length: 'long',
      keywords: request.keywords,
      targetAudience: request.targetAudience,
    };

    const response = await this.generateContent(aiRequest);
    const content = response.content;

    // Parse the generated content
    const parsed = this.parseGeneratedContent(content, template);
    
    // Calculate metrics
    const wordCount = this.calculateWordCount(content);
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Generate SEO data
    const seoData = this.generateSEOData(parsed.title, parsed.summary, request.keywords, template);

    return {
      title: parsed.title,
      content: parsed.content,
      summary: parsed.summary,
      keyTakeaways: parsed.keyTakeaways,
      seoData,
      wordCount,
      readingTime,
    };
  }

  private buildAutoBlogPrompt(request: AutoBlogRequest, template: BlogPostTemplate): string {
    const { niche, keywords, targetAudience, affiliateLinks, internalLinks } = request;
    
    return `You are an expert content writer specializing in ${niche} content. Create a comprehensive, SEO-optimized blog post following these specific requirements:

NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience}
KEYWORDS: ${keywords.join(', ')}
POST TYPE: ${template.title}

CONTENT REQUIREMENTS:
1. Follow the exact structure: ${template.structure.join(' → ')}
2. Write ${template.wordCount} words minimum
3. Use a 10-year-old reading level for clarity
4. Include natural keyword integration
5. Provide genuine value and solve problems
6. Be original and add unique insights
7. Include internal linking opportunities
8. Optimize for search engines

AFFILIATE GUIDELINES:
- Be honest and genuine in reviews
- Disclose affiliate relationships
- Focus on solving problems, not selling
- Include affiliate links naturally where relevant
- Provide balanced pros and cons

SEO OPTIMIZATION:
- Use H2 and H3 headings strategically
- Include target keywords in headings and content
- Write compelling meta descriptions
- Optimize for featured snippets
- Include schema markup suggestions

CONTENT STRUCTURE:
${template.structure.map((step, index) => `${index + 1}. ${step}`).join('\n')}

AFFILIATE LINKS TO INCLUDE: ${affiliateLinks?.join(', ') || 'None specified'}
INTERNAL LINKS TO INCLUDE: ${internalLinks?.join(', ') || 'None specified'}

Generate the complete blog post with title, content, summary, and key takeaways. Format the response as:
TITLE: [Title]
SUMMARY: [2-3 sentence summary]
KEY TAKEAWAYS: [3-5 bullet points]
CONTENT: [Full blog post content]`;
  }

  private parseGeneratedContent(content: string, template: BlogPostTemplate): {
    title: string;
    content: string;
    summary: string;
    keyTakeaways: string[];
  } {
    const lines = content.split('\n');
    let title = '';
    let summary = '';
    let keyTakeaways: string[] = [];
    let contentStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('SUMMARY:')) {
        summary = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('KEY TAKEAWAYS:')) {
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('CONTENT:')) {
          const takeaway = lines[j].trim();
          if (takeaway && (takeaway.startsWith('-') || takeaway.startsWith('•') || takeaway.startsWith('*'))) {
            keyTakeaways.push(takeaway.replace(/^[-•*]\s*/, ''));
          }
          j++;
        }
      } else if (line.startsWith('CONTENT:')) {
        contentStart = i + 1;
        break;
      }
    }

    const parsedContent = lines.slice(contentStart).join('\n').trim();

    return {
      title: title || `Best ${template.title} Guide`,
      content: parsedContent,
      summary: summary || 'Comprehensive guide with expert insights and recommendations.',
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [
        'Expert insights and recommendations',
        'Comprehensive analysis and comparisons',
        'Actionable tips and strategies'
      ],
    };
  }

  private calculateWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateSEOData(title: string, summary: string, keywords: string[], template: BlogPostTemplate): any {
    return {
      metaTitle: `${title} - Complete Guide ${new Date().getFullYear()}`,
      metaDescription: summary.length > 160 ? summary.substring(0, 157) + '...' : summary,
      metaKeywords: [...keywords, ...template.seoFocus].join(', '),
      schemaMarkup: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": summary,
        "keywords": keywords.join(', '),
        "articleType": template.type,
        "wordCount": this.calculateWordCount(summary),
      },
      openGraph: {
        title,
        description: summary,
        type: 'article',
        keywords: keywords.join(', '),
      },
      twitterCard: {
        title,
        description: summary,
        type: 'summary_large_image',
      }
    };
  }

  async generateContentWithHistory(
    request: AIContentGenerationRequest,
    userId: string,
    siteId: string
  ): Promise<{ response: AIContentGenerationResponse; history: AIGenerationHistory }> {
    const response = await this.generateContent(request);
    
    const history: AIGenerationHistory = {
      id: crypto.randomUUID(),
      userId,
      siteId,
      request,
      response,
      createdAt: new Date(),
      cost: this.calculateCost(response),
    };

    return { response, history };
  }

  private calculateCost(response: AIContentGenerationResponse): number {
    // Calculate cost based on token usage and provider rates
    const { usage } = response;
    const totalTokens = usage?.totalTokens || 0;
    
    // Example rates (these should be configurable)
    const costPer1kTokens = 0.03; // $0.03 per 1k tokens
    return (totalTokens / 1000) * costPer1kTokens;
  }

  getBlogTemplates(): Record<BlogPostTemplate['type'], BlogPostTemplate> {
    return this.blogTemplates;
  }

  async generateScheduledContent(siteId: string, schedule: any): Promise<void> {
    // This method would be called by a cron job or scheduler
    const { postTypes, categories, keywords } = schedule;
    
    for (const postType of postTypes) {
      try {
        const request: AutoBlogRequest = {
          siteId,
          niche: schedule.niche,
          postType: postType as BlogPostTemplate['type'],
          keywords,
          targetAudience: schedule.targetAudience,
          tone: 'professional',
          provider: 'openai',
        };

        const blogPost = await this.generateAutoBlogPost(request);
        
        // Save to database (this would be implemented with the database service)
        console.log('Generated scheduled content:', blogPost.title);
      } catch (error) {
        console.error('Failed to generate scheduled content:', error);
      }
    }
  }
} 