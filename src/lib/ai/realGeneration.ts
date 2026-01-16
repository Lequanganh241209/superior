
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface RealCode {
    code: string;
    tokensUsed: number;
    cost: number;
}

export class RealAIGeneration {
  async generateRealCode(prompt: string, userId: string, userContext: any): Promise<RealCode> { 
    // 1. REAL AI call với user-specific parameters 
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Using the latest optimized model
        messages: [
            { 
              role: 'system', 
              content: `You are an expert full-stack developer. Generate code for user ${userId}. Context: ${JSON.stringify(userContext)}` 
            }, 
            { role: 'user', content: prompt } 
        ],
        temperature: 0.7,
        max_tokens: 4096
    });

    const content = completion.choices[0].message.content || '';
    const tokens = completion.usage?.total_tokens || 0;
     
    // 2. Log generation (Mock DB call)
    console.log(`[AI] Generated ${tokens} tokens for user ${userId}`);
     
    return { 
      code: content, 
      tokensUsed: tokens, 
      cost: this.calculateCost(tokens) 
    }; 
  } 

  private calculateCost(tokens: number): number {
      // Approx cost for GPT-4o input/output mix
      return (tokens / 1000) * 0.01; 
  }
}
