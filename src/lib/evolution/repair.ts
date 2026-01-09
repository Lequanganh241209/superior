import { FileChange, getBlobText, getMainRepoTreeEntries } from "@/lib/github/service";

const STANDARD_FIX_FILES: FileChange[] = [
  {
    path: "src/lib/utils.ts",
    content: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
  },
  {
    path: "src/components/ui/button.tsx",
    content: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`
  },
  {
    path: "src/components/ui/card.tsx",
    content: `import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`
  }
];

function getRelativePrefixForFilePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  // Assumes structure starts with src/ or just file in root (if rootIndex logic needed, adjust)
  // For generated projects, everything usually in src/
  const rootIndex = parts[0] === "src" ? 1 : 0;
  const dirPartsCount = parts.length - 1 - rootIndex;
  return dirPartsCount > 0 ? "../".repeat(dirPartsCount) : "./";
}

function rewriteImports(content: string, filePath: string) {
  const relativePrefix = getRelativePrefixForFilePath(filePath);
  const next = content
    .replace(/(['"])@\//g, `$1${relativePrefix}`)
    .replace(/(['"])\/(components|lib|app|hooks|store)\//g, `$1${relativePrefix}$2/`);
  return next;
}

function mergeRequiredDeps(packageJsonText: string) {
  const parsed = JSON.parse(packageJsonText);
  const deps: Record<string, string> = parsed.dependencies && typeof parsed.dependencies === "object" ? parsed.dependencies : {};
  const devDeps: Record<string, string> = parsed.devDependencies && typeof parsed.devDependencies === "object" ? parsed.devDependencies : {};

  const required: Record<string, string> = {
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.0.2",
    "lucide-react": "^0.300.0"
  };

  const requiredDev: Record<string, string> = {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0"
  };

  let changed = false;
  for (const [name, version] of Object.entries(required)) {
    if (!deps[name]) {
      deps[name] = version;
      changed = true;
    }
  }
  
  for (const [name, version] of Object.entries(requiredDev)) {
    if (!devDeps[name]) {
      devDeps[name] = version;
      changed = true;
    }
  }

  parsed.dependencies = deps;
  parsed.devDependencies = devDeps;

  return { changed, content: JSON.stringify(parsed, null, 2) };
}

export async function generateRepairChanges(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<FileChange[]> {
  const entries = await getMainRepoTreeEntries(owner, repo, accessToken);
  const blobs = new Map(entries.filter((e) => e.type === "blob").map((e) => [e.path, e.sha]));

  const changes: FileChange[] = [];

  // 1. Ensure Standard Components exist
  for (const std of STANDARD_FIX_FILES) {
    if (!blobs.has(std.path)) {
      changes.push(std);
    }
  }

  // 2. Fix package.json dependencies
  const packageSha = blobs.get("package.json");
  if (packageSha) {
    try {
      const pkgText = await getBlobText(owner, repo, packageSha, accessToken);
      const merged = mergeRequiredDeps(pkgText);
      if (merged.changed) {
        changes.push({ path: "package.json", content: merged.content });
      }
    } catch (e) {
      console.error("Failed to process package.json:", e);
    }
  }

  // 3. Rewrite Imports in .ts/.tsx files
  const codeFiles = Array.from(blobs.entries())
    .filter(([path]) => path.endsWith(".ts") || path.endsWith(".tsx"));

  for (const [path, sha] of codeFiles) {
    try {
      const text = await getBlobText(owner, repo, sha, accessToken);
      const rewritten = rewriteImports(text, path);
      if (rewritten !== text) {
        changes.push({ path, content: rewritten });
      }
    } catch (e) {
        console.error(`Failed to process ${path}:`, e);
    }
  }

  return changes;
}
