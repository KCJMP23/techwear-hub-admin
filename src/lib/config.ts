import { z } from 'zod';
import { AIServiceConfig } from '@affiliate-template/shared-types';

const aiConfigSchema = z.object({
  openai: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().url().optional(),
    defaultModel: z.string().default('gpt-4o-mini'),
  }),
  claude: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().url().optional(),
    defaultModel: z.string().default('claude-3-haiku-20240307'),
  }),
  leonardo: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().url().optional(),
  }),
});

export function getAIConfig(): AIServiceConfig {
  const config = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL,
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY || '',
      baseUrl: process.env.CLAUDE_BASE_URL,
      defaultModel: process.env.CLAUDE_DEFAULT_MODEL || 'claude-3-haiku-20240307',
    },
    leonardo: {
      apiKey: process.env.LEONARDO_API_KEY || '',
      baseUrl: process.env.LEONARDO_BASE_URL,
    },
  };

  const result = aiConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`AI configuration error: ${result.error.message}`);
  }

  return result.data;
}

export const aiConfig = getAIConfig(); 