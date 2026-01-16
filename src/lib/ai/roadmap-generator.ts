
export interface RoadmapPhase {
  phase: string;
  timeline: string;
  focus: string;
  features: string[];
  techStack: string;
}

export class RoadmapGenerator {
  static generateRoadmap(projectType: string): RoadmapPhase[] {
    return [
      {
        phase: "VERSION T0 (Launch Day)",
        timeline: "Now",
        focus: "MVP & Core Value",
        features: ["Core Functionality", "Basic Analytics", "Mobile Responsive"],
        techStack: "Next.js 14, Tailwind, Supabase (Basic)"
      },
      {
        phase: "VERSION T+90 (Growth)",
        timeline: "3 Months",
        focus: "Optimization & Retention",
        features: ["A/B Testing", "User Feedback Loop", "Advanced Filtering", "Email Marketing Integration"],
        techStack: "Add Redis Caching, Analytics Dashboard"
      },
      {
        phase: "VERSION T+365 (Scale)",
        timeline: "1 Year",
        focus: "Expansion & Ecosystem",
        features: ["Internationalization (i18n)", "Mobile App (React Native)", "AI Recommendation Engine", "API for Partners"],
        techStack: "Microservices transition (if needed), Global CDN"
      }
    ];
  }

  static getRoadmapMarkdown(projectType: string): string {
    const roadmap = this.generateRoadmap(projectType);
    return `
## 🚀 TIME TRAVEL ROADMAP
| Phase | Timeline | Focus | Key Features |
|-------|----------|-------|--------------|
${roadmap.map(r => `| **${r.phase}** | ${r.timeline} | ${r.focus} | ${r.features.join(', ')} |`).join('\n')}
    `;
  }
}
