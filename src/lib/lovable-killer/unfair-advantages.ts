
export class UnfairAdvantageGenerator {
  static getAdvantages(type: string): string[] {
    const advantages: Record<string, string[]> = {
      'ecommerce': [
        '🚀 AI Personal Shopper (Embedded)',
        '⛓️ Blockchain Supply Chain Tracking',
        '👓 AR Virtual Try-On Module',
        '📦 Predictive Inventory Management'
      ],
      'saas': [
        '🤖 AI Co-pilot for every feature',
        '🕵️ Auto-Competitor Monitoring',
        '📉 Predictive Churn Prevention',
        '🦠 Viral Referral Engine'
      ],
      'general': [
        '✨ AI Magic Layer',
        '⚡ Edge Caching by Default',
        '🛡️ Military-grade Security'
      ]
    };

    return advantages[type] || advantages['general'];
  }
}
