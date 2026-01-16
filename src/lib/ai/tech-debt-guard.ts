
export class TechDebtGuard {
  // List of stable, long-term safe dependencies
  static readonly APPROVED_STACK = [
    'react', 'next', 'tailwindcss', 'lucide-react', 'clsx', 'tailwind-merge', 
    'framer-motion', 'zod', 'react-hook-form', 'zustand', 'tanstack/react-query'
  ];

  // List of risky or obsolete tech
  static readonly RISKY_TECH = [
    { name: 'moment', reason: 'Obsolete. Use date-fns or dayjs.' },
    { name: 'enzyme', reason: 'Dead. Use React Testing Library.' },
    { name: 'styled-components', reason: 'Trend shifting to Tailwind/CSS-in-JS zero-runtime.' },
    { name: 'redux-thunk', reason: 'Legacy. Use Redux Toolkit or React Query.' },
    { name: 'bootstrap', reason: 'Legacy. Use Tailwind.' },
    { name: 'jquery', reason: 'Obsolete in React world.' }
  ];

  static scanForObsolescence(code: string, dependencies: Record<string, string>): string[] {
    const warnings: string[] = [];

    // Check dependencies
    Object.keys(dependencies).forEach(dep => {
      const risk = this.RISKY_TECH.find(r => r.name === dep);
      if (risk) {
        warnings.push(`⚠️ OBSOLESCENCE WARNING: '${dep}' is flagged: ${risk.reason}`);
      }
    });

    // Check code patterns
    if (code.includes('float: left')) warnings.push("⚠️ CSS Float detected. Use Flexbox or Grid for layout.");
    if (code.includes('var ')) warnings.push("⚠️ ES5 'var' detected. Use 'const' or 'let'.");
    if (code.includes('componentWillMount')) warnings.push("⚠️ Legacy React Lifecycle detected. Use Hooks.");

    return warnings;
  }

  static getFutureProofingDirectives(): string {
    return `
    ## 📈 ANTI-OBSOLESCENCE PROTOCOL ACTIVE
    - **NO** legacy CSS (floats, clearfixes). Use Grid/Flexbox.
    - **NO** class components. Use Functional Components + Hooks.
    - **NO** heavy libraries (Lodash full import, Moment.js).
    - **YES** Accessibility (ARIA labels, semantic HTML).
    - **YES** TypeScript strict mode patterns.
    `;
  }
}
