
import { AI_CONFIG } from './config';
import { DelightSystem } from './delight-system';
import { TechDebtGuard } from './tech-debt-guard';
import { RoadmapGenerator } from './roadmap-generator';

export class PromptBuilder {
  static buildSystemPrompt(userPrompt: string): string {
    // Detect Personality & Context
    const personality = this.detectPersonality(userPrompt);
    const businessType = this.detectBusinessType(userPrompt);
    const culture = DelightSystem.getCulturalContext(userPrompt);
    const roadmapMarkdown = RoadmapGenerator.getRoadmapMarkdown(businessType);
    const techGuard = TechDebtGuard.getFutureProofingDirectives();
    const randomDelight = DelightSystem.getRandomDelight();

    return `
      ${AI_CONFIG.systemPrompt}

      ## 🎭 PERSONALITY MATRIX ACTIVATED
      User Request Analysis: "${userPrompt}"
      Detected Personality: **${personality.style} & ${personality.energy}**
      
      👉 **DESIGN DIRECTIVE**:
      - **Colors**: ${personality.colors}
      - **Typography**: ${personality.typography}
      - **Tone of Voice**: ${personality.voice}
      
      ## 🌍 CULTURAL CONTEXT ENGINE
      - **Locale**: ${culture.locale}
      - **Currency**: ${culture.currency}
      - **Lucky Color**: ${culture.luckyColor}
      - **Direction**: ${culture.direction}
      
      ## 🧠 PSYCHOLOGICAL TRIGGERS TO IMPLEMENT
      ${this.getTriggers(businessType)}

      ## 🔮 THE 3 MAGIC QUESTIONS (ANSWER THESE IN YOUR CODE)
      1. **Persona**: If this site was a person, it would be a ${personality.persona}.
      2. **Feeling**: Users should feel ${personality.feeling} immediately.
      3. **USP**: The unique "hook" is ${this.detectUSP(userPrompt)}.

      ## ✨ UNEXPECTED DELIGHT INJECTION
      You MUST implement this specific micro-interaction:
      "${randomDelight}"

      ${techGuard}

      ## 🚀 FUTURE ROADMAP AWARENESS
      Design the code to be compatible with this future vision:
      ${roadmapMarkdown}

      ## 🛡️ REALITY CHECK
      - Assume user has NO backend yet -> Mock API calls with realistic delays (500ms).
      - Assume mobile traffic -> Make buttons at least 44px high.
    `;
  }

  private static detectPersonality(prompt: string) {
    const p = prompt.toLowerCase();
    
    // Matrix Logic
    if (p.includes('bank') || p.includes('law') || p.includes('corporate')) {
      return {
        style: 'Professional',
        energy: 'Calm',
        colors: 'Navy Blue, Slate Gray, White',
        typography: 'Serif headings (Playfair Display) + Sans body (Inter)',
        voice: 'Trustworthy, Clear, Authoritative',
        persona: 'Senior Consultant',
        feeling: 'Secure and Respected'
      };
    }
    
    if (p.includes('game') || p.includes('party') || p.includes('kid')) {
      return {
        style: 'Casual',
        energy: 'Playful',
        colors: 'Vibrant Orange, Purple, Yellow',
        typography: 'Rounded Sans (Nunito or Fredoka)',
        voice: 'Fun, Exciting, Friendly',
        persona: 'Entertaining Host',
        feeling: 'Joyful and Curious'
      };
    }

    if (p.includes('fashion') || p.includes('luxury') || p.includes('art')) {
      return {
        style: 'Luxury',
        energy: 'Bold',
        colors: 'Black, Gold, Cream',
        typography: 'Elegant Serif (Cinzel) + Minimal Sans',
        voice: 'Sophisticated, Minimalist',
        persona: 'Art Curator',
        feeling: 'Exclusive and Inspired'
      };
    }

    // Default: Modern SaaS
    return {
      style: 'Professional',
      energy: 'Energetic',
      colors: 'Blue, Indigo, White',
      typography: 'Clean Sans (Inter or Plus Jakarta Sans)',
      voice: 'Helpful, Efficient, Smart',
      persona: 'Tech Genius',
      feeling: 'Empowered and Efficient'
    };
  }

  private static detectBusinessType(prompt: string) {
    const p = prompt.toLowerCase();
    if (p.includes('shop') || p.includes('store')) return 'ecommerce';
    if (p.includes('saas') || p.includes('app')) return 'saas';
    if (p.includes('portfolio') || p.includes('me')) return 'portfolio';
    return 'general';
  }

  private static getTriggers(type: string) {
    if (type === 'ecommerce') {
      return `
      - **Scarcity**: "Only 3 left in stock" badge.
      - **Social Proof**: "1,200+ happy customers" in hero.
      - **Urgency**: "Sale ends in 24h" banner.
      `;
    }
    if (type === 'saas') {
      return `
      - **Authority**: "Trusted by Fortune 500" logos.
      - **Risk Reversal**: "No credit card required" text.
      - **Consensus**: "Join 10,000+ developers".
      `;
    }
    return `- **Liking**: Use friendly micro-copy (e.g., "Hello there!").`;
  }

  private static detectUSP(prompt: string) {
    // Simple extraction or default
    return "Simplicity and Speed"; 
  }
}
