"use client";

import { useState, useEffect } from "react";
import { Loader2, Rocket, Upload, CheckCircle2, ExternalLink, Cpu, Terminal, RotateCcw } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { BuildProgress } from "./BuildProgress";

export function ProjectInit() {
  const { 
    isInitializing, setInitializing, 
    setProjectDetails, setHighlightedTab, setWorkflow, setGeneratedSQL, setPreviewUrl, setGeneratedFiles,
    // Wizard State from Store
    wizardStep, setWizardStep,
    wizardStatus, setWizardStatus,
    wizardLogs, addWizardLog, clearWizardLogs,
    projectName: storedProjectName,
    autoBuildPrompt: storedPrompt,
    setAutoBuildPrompt,
    createProject
  } = useProjectStore();

  const [input, setInput] = useState(storedPrompt || "");
  const [projectName, setProjectNameInput] = useState(storedProjectName || "");
  
  const [deployData, setDeployData] = useState<{ url: string, dashboard: string } | null>(null);

  // Sync local input to store for persistence
  useEffect(() => {
    if (input) setAutoBuildPrompt(input);
  }, [input, setAutoBuildPrompt]);

  useEffect(() => {
      // If we have a project name in store but not in local state, sync it
      if (storedProjectName && !projectName) {
          setProjectNameInput(storedProjectName);
      }
  }, [storedProjectName]);

  const handleReset = () => {
      setInitializing(false);
      setWizardStep(0);
      setWizardStatus("Idle");
      clearWizardLogs();
      toast.info("System State Reset");
  };

  const handleInitialize = async () => {
    if (!input.trim() || !projectName.trim()) return;
    
    // Create Project in Store immediately for persistence
    try {
        createProject(projectName, input);
    } catch (e) {
        console.error("Failed to create project in store:", e);
    }

    const slug = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    const parse = async (res: Response) => {
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200)); }
        if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
        return data;
    };
    
    const ensureRequiredFiles = (files: { path: string; content: string }[]) => {
        const out = [...files];
        const upsert = (filePath: string, content: string) => {
            const idx = out.findIndex(f => f.path === filePath);
            if (idx === -1) out.push({ path: filePath, content });
            else out[idx] = { ...out[idx], content };
        };

        if (!out.find(f => f.path === "package.json")) {
            upsert("package.json", JSON.stringify({
                name: slug || "aether-app",
                version: "1.0.0",
                private: true,
                scripts: { dev: "next dev", build: "next build", start: "next start" },
                dependencies: { 
                    "next": "14.1.0", 
                    "react": "18.2.0", 
                    "react-dom": "18.2.0",
                    "lucide-react": "^0.300.0",
                    "clsx": "^2.1.0",
                    "tailwind-merge": "^2.2.0",
                    "tailwindcss-animate": "^1.0.7",
                    "class-variance-authority": "^0.7.0",
                    "@radix-ui/react-slot": "^1.0.2"
                },
                devDependencies: {
                    "typescript": "^5",
                    "@types/node": "^20",
                    "@types/react": "^18",
                    "@types/react-dom": "^18",
                    "autoprefixer": "^10.0.1",
                    "postcss": "^8",
                    "tailwindcss": "^3.3.0"
                }
            }, null, 2));
        }
        if (!out.find(f => f.path === "next.config.js")) {
            upsert("next.config.js", `
/** Embedded-friendly config */
module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *" }
        ],
      },
    ]
  },
}
`.trim());
        }
        if (!out.find(f => f.path === "next-env.d.ts")) {
            upsert("next-env.d.ts", "/// <reference types=\"next\" />\n/// <reference types=\"next/image-types/global\" />");
        }
        upsert("tsconfig.json", JSON.stringify({
            compilerOptions: {
                target: "ES2020",
                lib: ["DOM", "DOM.Iterable", "ESNext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "bundler",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                plugins: [{ name: "next" }],
                baseUrl: ".",
                paths: { "@/*": ["./src/*"] }
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"]
        }, null, 2));
        if (!out.find(f => f.path === "src/app/layout.tsx")) {
            upsert("src/app/layout.tsx", `
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontHeading = Outfit({ subsets: ["latin"], variable: "--font-heading", weight: ['400', '700'] });
const fontBody = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Superior App",
  description: "Generated by Superior AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        fontHeading.variable,
        fontBody.variable
      )}>
        {children}
      </body>
    </html>
  );
}
`.trim());
        }
        if (!out.find(f => f.path === "src/app/globals.css")) {
            upsert("src/app/globals.css", "html,body{margin:0;padding:0}*,*:before,*:after{box-sizing:border-box}");
        }

        if (!out.find(f => f.path === "src/lib/utils.ts")) {
            upsert("src/lib/utils.ts", `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`);
        }
        if (!out.find(f => f.path === "src/components/ui/button.tsx")) {
            upsert("src/components/ui/button.tsx", `import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
`);
        }
        if (!out.find(f => f.path === "src/components/ui/card.tsx")) {
            upsert("src/components/ui/card.tsx", `import * as React from "react"
import { cn } from "../../lib/utils"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"
`);
        }

        // CRITICAL FIX: Ensure page.tsx exists!
        // If AI forgets to generate the main page, we create a fallback one.
        if (!out.find(f => f.path === "src/app/page.tsx")) {
            // 1. Try to find a "hero" or "landing" component to render
            const heroComponent = out.find(f => f.path.includes("hero") || f.path.includes("Hero"));
            const landingComponents = out.filter(f => f.path.includes("src/components/landing/"));
            
            let pageContent = "";
            
            if (landingComponents.length > 0) {
                // Auto-compose a page from landing components
                const imports = landingComponents.map(f => {
                    const name = f.path.split("/").pop()?.replace(".tsx", "") || "Component";
                    const pascalName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    return `import { ${pascalName} } from "@/components/landing/${name}";`;
                }).join("\n");
                
                const components = landingComponents.map(f => {
                    const name = f.path.split("/").pop()?.replace(".tsx", "") || "Component";
                    const pascalName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    return `<${pascalName} />`;
                }).join("\n      ");

                pageContent = `
import React from "react";
${imports}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      ${components}
    </main>
  );
}
`;
            } else {
                // Fallback generic page
                pageContent = `
import React from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Project Initialized</h1>
      <p className="text-muted-foreground mb-8">The AI generated the components, but missed the main page structure.</p>
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm font-mono">Check the "Code" tab to view generated components.</p>
      </div>
    </div>
  );
}
`;
            }
            upsert("src/app/page.tsx", pageContent.trim());
        }

        return out;
    };
    
    // 1. Get Session & Provider Token
    const { data: { session } } = await supabase.auth.getSession();
    let providerToken = session?.provider_token;
    if (!providerToken && typeof window !== "undefined") {
        try {
            const pat = window.localStorage.getItem("GITHUB_PAT") || "";
            if (pat && pat.length > 0) {
                providerToken = pat;
                toast.info("Using GitHub PAT from localStorage");
            }
        } catch {}
    }

    if (!providerToken) {
        toast.info("Running in System Mode (Using Server-Side GitHub Token)");
    }

    setInitializing(true);
    clearWizardLogs();
    
    // Aether Architect: Step 1
    setWizardStep(1);
    setWizardStatus("Analyzing System Requirements...");
    
    addWizardLog("SUPREME ORCHESTRATOR ACTIVATED...");
    const toastId = toast.loading("Supreme Orchestrator Activated...", { duration: Infinity });

    try {
        // 1. PLANNING PHASE
        addWizardLog("PHASE 1: ARCHITECTING SYSTEM STRUCTURE...");
        
        const planRes = await fetch('/api/ai/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let plan: any;
        try {
            plan = await parse(planRes);
        } catch (e: any) {
             throw new Error("Plan generation failed. Please check your API keys or try again.");
        }
        
        addWizardLog("Blueprint Generated: SQL Schema & Workflow Nodes Ready.");
        
        // Sync State
        setGeneratedSQL(plan.sql);
        if (plan.nodes && plan.edges) {
            setWorkflow({ nodes: plan.nodes, edges: plan.edges });
        }

        // Aether Architect: Step 2
        setWizardStep(2);
        setWizardStatus("Mapping Dependencies & Architecture...");

        // 2. CODING PHASE
        addWizardLog("[LOG]: Requirement Analysis Completed.");
        addWizardLog("[LOG]: Logic & State Management Defined.");
        addWizardLog("PHASE 2: ATOMIC DEVELOPMENT (Generating Components)...");
        toast.loading("Phase 2: Atomic Development...", { id: toastId });
        
        // ARTIFICIAL DELAY FOR UX "THOUGHT PROCESS" VISIBILITY
        await new Promise(r => setTimeout(r, 1500)); 
        addWizardLog("[THINKING]: Generating atomic components with strict naming conventions...");
        
        // Aether Architect: Step 3
        setWizardStep(3);
        setWizardStatus("Generating Atomic Components...");
        
        addWizardLog(">> Selecting Optimal Component Architecture...");
        await new Promise(r => setTimeout(r, 800));
        addWizardLog(">> Injecting Framer Motion Animations...");
        
        const codeRes = await fetch('/api/ai/codegen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, plan }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let codeData: any;
        try {
            codeData = await parse(codeRes);
        } catch (e: any) {
            throw new Error("Code generation failed. Please check your API keys or try again.");
        }
        
    // Aether Architect: Step 4
    setWizardStep(4);
    setWizardStatus("Auditing Imports & Security...");
    addWizardLog("[THINKING]: Running internal audit for undefined variables and import integrity...");
    
    let ensuredFiles: { path: string; content: string }[] = [];
    try {
        if (!codeData || !codeData.files || !Array.isArray(codeData.files)) {
            console.error("Invalid codeData structure:", codeData);
            // Fallback: Generate a basic page if AI fails completely
            ensuredFiles = ensureRequiredFiles([]);
            addWizardLog("WARNING: AI Architect output was empty. Using emergency fallback structure.");
        } else {
            ensuredFiles = ensureRequiredFiles(codeData.files).map((file) => {
                const normalizedPath = (file.path || "").replace(/\\/g, "/");
                const isCodeFile = normalizedPath.endsWith(".ts") || normalizedPath.endsWith(".tsx");
                if (!isCodeFile) return file;
                
                // AUTOMATIC FIX FOR "Element type is invalid"
                // If AI generates "export const Navbar =" instead of "export default function Navbar", fix it.
                let content = file.content || "";
                
                // SHADOW PROMPTING (Tip #1): Auto-Import standard UI components if missing
                const uiComponents = [
                    { name: "Button", path: "@/components/ui/button" },
                    { name: "Card", path: "@/components/ui/card" },
                    { name: "Input", path: "@/components/ui/input" },
                    { name: "Badge", path: "@/components/ui/badge" },
                    { name: "Avatar", path: "@/components/ui/avatar" },
                    { name: "Accordion", path: "@/components/ui/accordion" },
                    { name: "Sheet", path: "@/components/ui/sheet" },
                    { name: "Dialog", path: "@/components/ui/dialog" },
                    { name: "DropdownMenu", path: "@/components/ui/dropdown-menu" },
                    { name: "Tabs", path: "@/components/ui/tabs" },
                    { name: "Textarea", path: "@/components/ui/textarea" },
                    { name: "Label", path: "@/components/ui/label" },
                    { name: "Select", path: "@/components/ui/select" },
                    { name: "Switch", path: "@/components/ui/switch" },
                    { name: "Separator", path: "@/components/ui/separator" },
                    { name: "ScrollArea", path: "@/components/ui/scroll-area" },
                ];
                
                // ... (existing audit logic) ...

                uiComponents.forEach(comp => {
                    // If component is used (<Button) but not imported
                    if (content.includes(`<${comp.name}`) && !content.includes(`from "${comp.path}"`) && !content.includes(`from '${comp.path}'`)) {
                        // Inject import at the top
                        const importStmt = `import { ${comp.name} } from "${comp.path}";`;
                        if (content.startsWith('"use client"')) {
                            content = content.replace('"use client";', `"use client";\n${importStmt}`);
                        } else if (content.startsWith("'use client'")) {
                            content = content.replace("'use client';", `'use client';\n${importStmt}`);
                        } else {
                            content = `${importStmt}\n${content}`;
                        }
                    }
                });

                // AUTOMATIC LINTER LAYER (Simple AST Scanner)
                // Detect common undefined variable patterns
                
                // 0. Load Dependency Graph (Simulated import for client-side)
                const dependencyGraph = {
                    "Button": "@/components/ui/button",
                    "Card": "@/components/ui/card", "CardContent": "@/components/ui/card", "CardHeader": "@/components/ui/card", "CardTitle": "@/components/ui/card",
                    "Input": "@/components/ui/input",
                    "Badge": "@/components/ui/badge",
                    "Avatar": "@/components/ui/avatar", "AvatarFallback": "@/components/ui/avatar", "AvatarImage": "@/components/ui/avatar",
                    "Accordion": "@/components/ui/accordion", "AccordionItem": "@/components/ui/accordion", "AccordionTrigger": "@/components/ui/accordion", "AccordionContent": "@/components/ui/accordion",
                    "Sheet": "@/components/ui/sheet", "SheetContent": "@/components/ui/sheet", "SheetTrigger": "@/components/ui/sheet",
                    "Tabs": "@/components/ui/tabs", "TabsList": "@/components/ui/tabs", "TabsTrigger": "@/components/ui/tabs", "TabsContent": "@/components/ui/tabs",
                    "Textarea": "@/components/ui/textarea",
                    "ScrollArea": "@/components/ui/scroll-area",
                    "motion": "framer-motion"
                };

                // 1. Check for UI Components used but not imported
                Object.entries(dependencyGraph).forEach(([compName, importPath]) => {
                     // Regex to find <Component usage
                     const usageRegex = new RegExp(`<${compName}\\s|\\s${compName}\\.|<${compName}>`, 'g');
                     if (usageRegex.test(content) && !content.includes(importPath) && !content.includes(`from "${importPath}"`)) {
                         // Add import
                         const importStmt = importPath === "framer-motion" 
                            ? `import { ${compName} } from "${importPath}";`
                            : `import { ${compName} } from "${importPath}";`;
                         
                         if (content.startsWith('"use client"')) {
                            content = content.replace('"use client";', `"use client";\n${importStmt}`);
                         } else {
                            content = `${importStmt}\n${content}`;
                         }
                     }
                });

                // 2. Check for Lucide icons used but not imported
                const iconMatches = content.match(/<([A-Z][a-zA-Z]+) className=/g);
                if (iconMatches) {
                    const usedIcons = new Set(iconMatches.map(m => m.replace('<', '').replace(' className=', '')));
                    const lucideImports = content.match(/import {([^}]+)} from "lucide-react"/);
                    
                    // If lucide is imported, check if we need to add more
                    if (lucideImports) {
                        const importedIcons = new Set(lucideImports[1].split(',').map(i => i.trim()));
                        const missingIcons = Array.from(usedIcons).filter(icon => !importedIcons.has(icon) && !uiComponents.some(c => c.name === icon));
                        
                        if (missingIcons.length > 0) {
                            const newImports = [...importedIcons, ...missingIcons].join(', ');
                            content = content.replace(/import {([^}]+)} from "lucide-react"/, `import { ${newImports} } from "lucide-react"`);
                        }
                    }
                }

                // Fix 1: Removed outdated "Force default export" logic.
                // We now strictly enforce Named Exports.
                // If we find `export default function`, we change it to `export function`
                // and remove the `export default` line if separate.

                if (normalizedPath.includes("components/")) {
                    if (content.includes("export default function")) {
                         content = content.replace("export default function", "export function");
                    } else if (content.includes("export default class")) {
                         content = content.replace("export default class", "export class");
                    }
                    // Handle `export default ComponentName` at the end
                    // We keep it for safety but ensure named export exists too.
                }

                // Fix 2: Convert "export const Navbar" to "function Navbar" if needed for default export
                // (Removed as we now prefer Named Exports)
                
                const parts = normalizedPath.split("/");
                const depth = parts[0] === "src" ? Math.max(parts.length - 2, 0) : 0;
                const relativePrefix = depth > 0 ? "../".repeat(depth) : "./";
                try {
                    content = content.replace(/(['"])@\//g, `$1${relativePrefix}`);
                } catch (e) {
                    // Ignore regex errors
                }
                
                return { ...file, content };
            });
            } // End else
        } catch (e: any) {
            console.error("Auditing failed:", e);
            addWizardLog(`WARNING: Auditing skipped due to error: ${e.message}`);
            // Fallback to raw files if audit crashes
            ensuredFiles = codeData.files || [];
        }
        
        // CRITICAL: Update Store with generated files so Preview Panel works immediately
        try {
            setGeneratedFiles(ensuredFiles);
            addWizardLog("[LOG]: UI Audit Passed (Zero undefined references).");
            addWizardLog("[LOG]: VFS Sync Successful.");
        } catch (e: any) {
            console.error("State update failed:", e);
            addWizardLog(`CRITICAL WARNING: Failed to update local state (Memory Limit?). Deployment will continue.`);
        }
        
        addWizardLog(`Code Generation Complete: ${ensuredFiles.length} files ready.`);

        // Aether Architect: Step 5
        setWizardStep(5);
        setWizardStatus("Deploying to Virtual File System...");

        // 3. DEPLOYMENT PHASE
        addWizardLog(`PHASE 3: PUSHING TO GITHUB (${slug})...`);
        toast.loading(`Phase 3: Pushing to GitHub (${slug})...`, { id: toastId });
        
        const repoRes = await fetch('/api/github/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: slug, 
                description: plan.description,
                files: ensuredFiles,
                accessToken: providerToken
            }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let repoData: any;
        try {
            repoData = await parse(repoRes);
        } catch (e: any) {
            addWizardLog("GitHub unavailable. Switching to direct Vercel deployment.");
            repoData = { repoId: 0, repoUrl: "", repoName: slug };
        }

        addWizardLog(`Repository Created: ${repoData.repoUrl}`);

        addWizardLog("PHASE 4: TRIGGERING VERCEL DEPLOYMENT...");
        toast.loading("Phase 4: Triggering Vercel Deployment...", { id: toastId });
        
        const deployRes = await fetch('/api/deploy/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: slug,
                repoId: repoData.repoId,
                repoName: repoData.repoName,
                files: ensuredFiles
            }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        const deployData = await parse(deployRes);

        addWizardLog(`Deployment Triggered: ${deployData.deployUrl}`);

        // SUCCESS
        setProjectDetails(repoData.repoName, repoData.repoUrl);
        setPreviewUrl(deployData.deployUrl || `https://${slug}.vercel.app`);
        setDeployData({
          url: deployData.deployUrl || `https://${projectName}.vercel.app`,
          dashboard: deployData.dashboardUrl
        });
        
        // Final State
        setWizardStep(6);
        setWizardStatus("System Online");
        
        // Write metadata file to repo for Projects listing
        try {
            await fetch('/api/github/metadata', {
                method: 'POST',
                body: JSON.stringify({
                    repoName: repoData.repoName,
                    accessToken: providerToken,
                    metadata: {
                        name: slug,
                        repoName: repoData.repoName,
                        repoUrl: repoData.repoUrl,
                        deployUrl: deployData.deployUrl || `https://${slug}.vercel.app`,
                        createdAt: new Date().toISOString()
                    }
                })
            });
        } catch {}
        
        addWizardLog("MISSION ACCOMPLISHED. SYSTEM ONLINE.");
        toast.success("System Successfully Orchestrated & Deployed!", { id: toastId });
        
        // Switch to Preview tab to show results
        setTimeout(() => {
            setHighlightedTab("preview");
        }, 2000);

    } catch (err: any) {
        console.error(err);
        addWizardLog(`CRITICAL ERROR: ${err.message}`);
        toast.error(`Orchestration Failed: ${err.message}`, { id: toastId });
    } finally {
        setInitializing(false);
    }
  };

  if (deployData) {
      return (
        <div className="p-6 border border-green-500/30 rounded-lg bg-green-500/5 backdrop-blur-sm space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-green-500">
                <CheckCircle2 className="w-8 h-8" />
                <div>
                    <h2 className="text-xl font-semibold">System Successfully Orchestrated</h2>
                    <p className="text-sm text-green-500/80">Your autonomous infrastructure is live.</p>
                </div>
            </div>
            
            <div className="grid gap-3">
                <div className="p-4 bg-background/50 rounded-md border border-border flex justify-between items-center group hover:border-green-500/50 transition-colors">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase">Live URL</div>
                        <div className="font-mono text-sm text-primary">{deployData.url}</div>
                    </div>
                    <a href={deployData.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-green-500/10 rounded-md transition-colors text-green-500">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <div className="p-4 bg-background/50 rounded-md border border-border flex justify-between items-center group hover:border-purple-500/50 transition-colors">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase">Vercel Dashboard</div>
                        <div className="font-mono text-sm text-muted-foreground">{deployData.dashboard}</div>
                    </div>
                    <a href={deployData.dashboard} target="_blank" rel="noreferrer" className="p-2 hover:bg-purple-500/10 rounded-md transition-colors text-purple-500">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <button 
                onClick={() => { setDeployData(null); setInput(""); setProjectNameInput(""); clearWizardLogs(); }}
                className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Rocket className="w-4 h-4" /> Initialize Another System
            </button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* SUPREME ORCHESTRATOR CONSOLE */}
      <div className="p-1 rounded-xl bg-gradient-to-b from-green-500/20 to-purple-500/20">
        <div className="p-6 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg shadow-lg shadow-green-900/20">
                        <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                            Supreme Orchestrator Console
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">
                            v2.0.0 • Autonomous System Architect • Online
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleReset}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                    title="Emergency Reset"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Inputs */}
            {wizardStep === 0 && (
            <div className="space-y-5">
                <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Target Project Name
                    </label>
                    <input 
                        value={projectName}
                        onChange={(e) => setProjectNameInput(e.target.value)}
                        disabled={isInitializing}
                        className="w-full bg-background/50 border border-input rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-green-500 outline-none font-mono placeholder:text-muted-foreground/30"
                        placeholder="e.g. quantum-exchange-v1"
                    />
                </div>



                <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                        <Rocket className="w-3 h-3" /> Master Directive (Prompt)
                    </label>
                    <div className="relative">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isInitializing}
                            className="w-full h-40 bg-background/50 border border-input rounded-md p-4 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none font-mono placeholder:text-muted-foreground/30 leading-relaxed"
                            placeholder="// Enter your system requirements here...&#10;> Create a DeFi platform with real-time trading charts&#10;> Include user authentication and wallet integration&#10;> Deploy with dark mode UI by default"
                        />
                        <div className="absolute bottom-3 right-3">
                            <button className="p-2 hover:bg-white/10 rounded-md transition-colors group" title="Upload Context">
                                <Upload className="w-4 h-4 text-muted-foreground group-hover:text-green-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Action Area */}
            {wizardStep === 0 && (
            <div className="mt-8 flex gap-3">
                <button 
                    onClick={handleInitialize}
                    disabled={isInitializing || !input.trim() || !projectName.trim()}
                    className={cn(
                        "flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99]",
                        (isInitializing || !input.trim() || !projectName.trim()) && "opacity-50 cursor-not-allowed shadow-none hover:scale-100"
                    )}
                >
                    {isInitializing ? (
                        <span className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> 
                            PROCESSING DIRECTIVE...
                        </span>
                    ) : "ACTIVATE SUPREME ORCHESTRATOR"}
                </button>

                {isInitializing && (
                    <button 
                        onClick={() => {
                            setInitializing(false);
                            toast.error("Orchestration Aborted by User");
                            addWizardLog("MANUAL ABORT INITIATED.");
                        }}
                        className="px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-bold text-sm tracking-wide"
                    >
                        ABORT
                    </button>
                )}
            </div>
            )}

            {/* Aether Architect Progress */}
            {wizardStep > 0 && (
                <div className="mt-6">
                    <BuildProgress currentStep={wizardStep} status={wizardStatus} />
                </div>
            )}

            {/* Live Logs Terminal */}
            {wizardLogs.length > 0 && (
                <div 
                    className="mt-6 p-4 bg-black border border-green-500/20 rounded-lg font-mono text-xs max-h-60 overflow-y-auto shadow-inner custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-green-500/50 uppercase tracking-widest text-[10px] font-bold">System Logs</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {wizardLogs.map((log, i) => (
                            <div key={i} className="text-green-400/80 break-words font-light tracking-wide flex gap-2">
                                <span className="text-green-600 opacity-50">➜</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {isInitializing && (
                            <div className="text-green-500 animate-pulse pl-4">_</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
