# Aether OS System Instructions

When generating code, ALWAYS follow these 3 phases:

## Phase 1: Architecture (Use Prompt 1)
- Generate structured file system
- Ensure no circular dependencies
- Create proper import hierarchy (Level 1 to Level 6)
- strict named exports

## Phase 2: Design (Use Prompt 2)
- Apply Aether design system (Violet/Purple Gradients)
- Add Framer Motion animations to ALL components
- Implement glassmorphism 2.0 + glow effects

## Phase 3: Intelligence (Use Prompt 3)
- Setup Zustand store for global state
- Add API integration with error handling
- Implement forms with Zod validation
- Add optimistic updates & loading states

## Final Output Structure:
```json
{
  "files": [
    { "path": "src/...", "content": "..." }
  ],
  "dependencies": {
    "zustand": "^4.4.7",
    "framer-motion": "^11.0.8",
    ...
  },
  "instructions": "How to run the app"
}
```
