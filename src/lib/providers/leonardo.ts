import { 
  ImageGenerationRequest, 
  ImageGenerationResponse 
} from '@affiliate-template/shared-types';
import { aiConfig } from '../config';

export class LeonardoService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = aiConfig.leonardo.apiKey || '';
    this.baseUrl = aiConfig.leonardo.baseUrl || 'https://cloud.leonardo.ai/api/rest/v1';
    
    if (!this.apiKey) {
      throw new Error('Leonardo.AI API key is required');
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const generationResponse = await this.createGeneration(request);
      const generationId = generationResponse.sdGenerationJob.generationId;
      
      // Poll for completion
      const result = await this.pollForCompletion(generationId);
      
      if (!result.generations_by_pk?.generated_images?.[0]?.url) {
        throw new Error('No image generated from Leonardo.AI');
      }

      return {
        imageUrl: result.generations_by_pk.generated_images[0].url,
        provider: 'leonardo',
        generationId,
        metadata: {
          model: 'leonardo-creative-sdxl-1.0',
          size: request.size || '1024x1024',
          style: request.style,
        },
      };
    } catch (error) {
      throw new Error(`Leonardo.AI image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createGeneration(request: ImageGenerationRequest) {
    const response = await fetch(`${this.baseUrl}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
        width: this.getWidth(request.size),
        height: this.getHeight(request.size),
        num_images: 1,
        guidance_scale: 7,
        init_strength: 0.35,
        scheduler: 'LEONARDO',
        public: false,
        promptMagic: true,
        photoReal: false,
        alchemy: false,
        contrastRatio: 0.5,
        highContrast: false,
        presetStyle: request.style || 'LEONARDO',
        init_generation_image_id: null,
        weightings: {},
        promptMagicVersion: 'v2',
        photoRealVersion: 'v2',
        alchemyVersion: 'v2',
        highContrastVersion: 'v2',
        presetStyleVersion: 'v2',
        init_generation_image_id_version: 'v2',
        weightingsVersion: 'v2',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Leonardo.AI API error: ${error}`);
    }

    return response.json();
  }

  private async pollForCompletion(generationId: string) {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check generation status: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.generations_by_pk?.status === 'COMPLETE') {
        return result;
      }

      if (result.generations_by_pk?.status === 'FAILED') {
        throw new Error('Image generation failed');
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Image generation timed out');
  }

  private getWidth(size?: string): number {
    switch (size) {
      case '256x256':
        return 256;
      case '512x512':
        return 512;
      case '1792x1024':
        return 1792;
      case '1024x1792':
        return 1024;
      default:
        return 1024;
    }
  }

  private getHeight(size?: string): number {
    switch (size) {
      case '256x256':
        return 256;
      case '512x512':
        return 512;
      case '1792x1024':
        return 1024;
      case '1024x1792':
        return 1792;
      default:
        return 1024;
    }
  }
} 