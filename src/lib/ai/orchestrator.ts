import { AI_CONFIG } from './config';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

type ModelProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';
type ModelTier = 'premium' | 'standard' | 'fast';

interface AIModel {
  provider: ModelProvider;
  modelId: string;
  contextWindow: number;
}

interface GenerationContext {
  projectType?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  previousErrors?: string[];
}

export class AIOrchestrator {
  private openai?: OpenAI;
  private anthropic?: Anthropic;

  private models: Record<ModelTier, AIModel[]> = {
    premium: [
      { provider: 'anthropic', modelId: 'claude-3-opus-20240229', contextWindow: 200000 },
      { provider: 'openai', modelId: 'gpt-4o', contextWindow: 128000 }
    ],
    standard: [
      { provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620', contextWindow: 200000 },
      { provider: 'openai', modelId: 'gpt-4-turbo', contextWindow: 128000 }
    ],
    fast: [
      { provider: 'anthropic', modelId: 'claude-3-haiku-20240307', contextWindow: 200000 },
      { provider: 'openai', modelId: 'gpt-3.5-turbo', contextWindow: 16000 }
    ]
  };

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  /**
   * Main entry point: Smartly selects model and handles fallbacks
   */
  async generateCode(prompt: string, context: GenerationContext = {}): Promise<string> {
    // 1. Analyze Complexity
    const tier = this.determineTier(prompt, context);
    console.log(`[ORCHESTRATOR] Selected Tier: ${tier}`);

    // 2. Select Models (Primary & Fallback)
    const candidates = this.models[tier];
    
    // 3. Try generation with fallback chain
    for (const model of candidates) {
      try {
        console.log(`[ORCHESTRATOR] Attempting with ${model.modelId} (${model.provider})...`);
        return await this.generateWithProvider(model, prompt);
      } catch (error: any) {
        console.warn(`[ORCHESTRATOR] Model ${model.modelId} failed:`, error.message);
        continue; // Try next model
      }
    }

    // 4. Ultimate Fallback (OpenRouter if configured, or throw)
    if (AI_CONFIG.openRouter.apiKey) {
        console.log(`[ORCHESTRATOR] All primary models failed. Switching to OpenRouter Fallback...`);
        return await this.callOpenRouter(prompt, AI_CONFIG.models.fallback);
    }

    throw new Error("All AI models failed to generate code. Please check API keys.");
  }

  private determineTier(prompt: string, context: GenerationContext): ModelTier {
    if (context.complexity === 'complex' || prompt.length > 2000) return 'premium';
    if (prompt.includes('architecture') || prompt.includes('refactor')) return 'premium';
    if (prompt.includes('fix') || prompt.includes('debug')) return 'standard';
    return 'standard'; // Default
  }

  private async generateWithProvider(model: AIModel, prompt: string): Promise<string> {
    if (model.provider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: model.modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });
      return response.choices[0]?.message?.content || '';
    }

    if (model.provider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: model.modelId,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    }

    throw new Error(`Provider ${model.provider} not initialized`);
  }

  private async callOpenRouter(prompt: string, model: string): Promise<string> {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${AI_CONFIG.openRouter.apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": AI_CONFIG.openRouter.siteUrl,
              "X-Title": AI_CONFIG.openRouter.siteName,
          },
          body: JSON.stringify({
              "model": model,
              "messages": [{ "role": "user", "content": prompt }]
          })
      });
      
      if (!response.ok) throw new Error("OpenRouter Failed");
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
  }
}
