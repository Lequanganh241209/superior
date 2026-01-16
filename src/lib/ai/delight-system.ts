
export class DelightSystem {
  private static delights = [
    "// 🥚 EASTER EGG: Konami Code handler included in footer",
    "// 🥚 EASTER EGG: Logo spins 360 degrees on triple click",
    "// ✨ DELIGHT: Button particles explode on click",
    "// ✨ DELIGHT: Scroll progress bar with gradient color",
    "// 🎩 MAGIC: Dark mode toggle plays a light switch sound",
    "// 🎩 MAGIC: 404 page has a playable mini-game"
  ];

  static getRandomDelight(): string {
    return this.delights[Math.floor(Math.random() * this.delights.length)];
  }

  static getCulturalContext(prompt: string) {
    const p = prompt.toLowerCase();
    
    // Simple heuristic detection
    if (p.includes('vietnam') || p.includes('vietnamese') || p.includes('hanoi') || p.includes('saigon')) {
      return {
        locale: 'vi-VN',
        currency: 'VND',
        dateFormat: 'DD/MM/YYYY',
        direction: 'ltr',
        luckyColor: 'Red/Gold', // Cultural nuance
        exampleAddress: '123 Nguyen Hue, Dist 1, HCMC'
      };
    }
    
    if (p.includes('japan') || p.includes('japanese') || p.includes('tokyo')) {
      return {
        locale: 'ja-JP',
        currency: 'JPY',
        dateFormat: 'YYYY/MM/DD',
        direction: 'ltr',
        luckyColor: 'Red/White',
        exampleAddress: 'Shibuya, Tokyo'
      };
    }

    // Default US/Global
    return {
      locale: 'en-US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      direction: 'ltr',
      luckyColor: 'Blue',
      exampleAddress: '123 Tech Blvd, San Francisco, CA'
    };
  }
}
