
// 🏗️ STRATEGY 3: ATOMIC DESIGN + VERIFIED COMPONENTS
// Instead of letting AI invent components, we force it to use these "Verified Patterns"

export const COMPONENT_LIBRARY_PROMPT = `
## 🧱 VERIFIED COMPONENT LIBRARY (USE THESE PATTERNS)

You MUST compose the UI using these pre-verified, accessibility-tested component structures. 
Do not invent new patterns for basic atoms.

### 1. ATOMS

**Button (Verified):**
\`\`\`tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// Usage: <Button variant="outline" size="sm">Click me</Button>
\`\`\`

**Card (Verified):**
\`\`\`tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
// Usage: <Card className="p-6">Content</Card>
\`\`\`

### 2. MOLECULES

**Input Field (Verified):**
\`\`\`tsx
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
\`\`\`

### 3. ORGANISMS (TEMPLATES)

**Responsive Navbar Pattern:**
- Use \`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur\`.
- Use \`hidden md:flex\` for desktop links.
- Use \`Sheet\` or \`Dialog\` for mobile menu (hamburger).

**Dashboard Layout Pattern:**
- Use \`grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]\`.
- Sidebar fixed on left, main content scrollable.

## 🛡️ GENERATION RULES
1. **Compose, Don't Reinvent**: If you need a button, generate the Button component code exactly as above first, then import and use it.
2. **Tailwind First**: Use \`flex\`, \`grid\`, \`gap-4\`, \`p-6\` for layout.
3. **Mobile First**: Always define base styles for mobile, then add \`md:\` for desktop.
`;
