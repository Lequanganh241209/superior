
export const GENERATION_CONSTRAINTS = {
  allowedFrameworks: ['React', 'Next.js'],
  cssMethodology: ['Tailwind CSS'],
  stateManagement: ['React Hooks', 'Zustand'], // Prefer simple hooks first
  
  // Banned Anti-patterns (Strictly Forbidden)
  bannedPatterns: [
    { pattern: /dangerouslySetInnerHTML/, reason: "Security Risk: XSS vulnerability" },
    { pattern: /eval\(/, reason: "Security Risk: Code execution" },
    { pattern: /style={{/, reason: "Anti-pattern: Use Tailwind classes instead of inline styles" },
    { pattern: /var\s+/, reason: "Legacy Code: Use const or let" },
    { pattern: /any/, reason: "Type Safety: Avoid 'any' type in TypeScript" },
    { pattern: /console\.log/, reason: "Production Quality: Remove debug logs" },
    { pattern: /alert\(/, reason: "UX: Use toast notifications instead of alerts" }
  ],

  // Accessibility Requirements
  accessibility: [
    { pattern: /<img(?!.*alt=)/, reason: "A11y: Images must have alt text" },
    { pattern: /<button(?!.*aria-)/, reason: "A11y: Buttons should have aria-label if text is not descriptive" },
    { pattern: /<input(?!.*aria-)/, reason: "A11y: Inputs must have accessible labels" }
  ],

  // Responsive Requirements
  responsive: {
    requiredPrefixes: ['md:', 'lg:', 'hidden md:block', 'flex-col md:flex-row']
  }
};
