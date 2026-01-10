import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';

export const maxDuration = 300;

// --- DESIGN PERSONAS (FORCE DIVERSITY) ---
const DESIGN_PERSONAS = [
    {
        id: "modern-minimal",
        name: "The Modern Minimalist (Lovable/V0 Style)",
        description: "Ultra-clean, whitespace-dominant. Inter/Geist font. Slate-900 text on white. Soft shadows (shadow-sm). Rounded-xl borders. Focus on typography and spacing.",
        css: "bg-white text-slate-950 selection:bg-slate-100",
        components: "Rounded-xl, thin borders (border-slate-200), subtle hover states."
    },
    {
        id: "saas-premium",
        name: "The SaaS Enterprise (Linear/Stripe)",
        description: "Trustworthy, high-end. Indigo/Violet accents. Glassmorphism details. Complex gradients. Dense but organized data display.",
        css: "bg-slate-50 text-slate-900 selection:bg-indigo-100",
        components: "Rounded-lg, backdrop-blur, delicate shadows (shadow-lg)."
    },
    {
        id: "cyber-future",
        name: "The Future Tech (Vercel/Raycast)",
        description: "Dark mode default. Zinc-950 background. White text. Gradient borders. Glow effects. Monospace code accents.",
        css: "bg-zinc-950 text-zinc-50 selection:bg-white/20",
        components: "Sharp or slightly rounded, glowing borders, high contrast."
    }
];

export async function POST(req: Request) {
  console.log("[CODEGEN] Received request");

  // DEFINITIONS
  const CONFIG_FILES = [
        {
             path: "package.json",
             content: JSON.stringify({
               "name": "superior-app",
               "version": "0.1.0",
               "private": true,
               "scripts": {
                 "dev": "next dev",
                 "build": "next build",
                 "start": "next start",
                 "lint": "next lint"
               },
               "dependencies": {
                 "react": "^18",
                 "react-dom": "^18",
                 "next": "14.1.0",
                 "lucide-react": "^0.344.0",
                 "clsx": "^2.1.0",
                 "tailwind-merge": "^2.2.1",
                 "tailwindcss-animate": "^1.0.7",
                 "class-variance-authority": "^0.7.0",
                 "@radix-ui/react-slot": "^1.0.2",
                 "@radix-ui/react-label": "^2.0.2",
                 "@radix-ui/react-accordion": "^1.0.1",
                 "@radix-ui/react-scroll-area": "^1.0.5",
                 "@radix-ui/react-dialog": "^1.0.5",
                 "@radix-ui/react-dropdown-menu": "^2.0.6",
                 "@radix-ui/react-tabs": "^1.0.4",
                 "@radix-ui/react-avatar": "^1.0.4",
                 "@radix-ui/react-switch": "^1.0.3",
                 "@radix-ui/react-popover": "^1.0.7",
                 "framer-motion": "^11.0.8",
                 "mini-svg-data-uri": "^1.4.4",
                 "recharts": "^2.12.0",
                 "date-fns": "^3.3.1"
              },
               "devDependencies": {
                 "@types/node": "^20",
                 "@types/react": "^18",
                 "@types/react-dom": "^18",
                 "autoprefixer": "^10.0.1",
                 "postcss": "^8",
                 "tailwindcss": "^3.3.0",
                 "typescript": "^5"
               }
             }, null, 2)
        },
        {
             path: "tsconfig.json",
             content: JSON.stringify({
               "compilerOptions": {
                 "lib": ["dom", "dom.iterable", "esnext"],
                 "allowJs": true,
                 "skipLibCheck": true,
                 "strict": true,
                 "noEmit": true,
                 "esModuleInterop": true,
                 "module": "esnext",
                 "moduleResolution": "bundler",
                 "resolveJsonModule": true,
                 "isolatedModules": true,
                 "jsx": "preserve",
                 "incremental": true,
                 "baseUrl": ".",
                 "plugins": [{ "name": "next" }],
                 "paths": { "@/*": ["./src/*"] }
               },
               "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
               "exclude": ["node_modules"]
             }, null, 2)
        },
        {
             path: "next.config.mjs",
             content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;`
        },
        {
             path: "postcss.config.js",
             content: "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {}, }, }"
        },
        {
             path: "src/lib/utils.ts",
             content: `import { type ClassValue, clsx } from "clsx"; import { twMerge } from "tailwind-merge"; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`
        },
        {
             path: "src/app/layout.tsx",
             content: `import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontHeading = Outfit({ subsets: ["latin"], variable: "--font-heading", weight: ['400', '700'] });
const fontBody = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Lovable Project",
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
`
        },
        {
             path: "tailwind.config.ts",
             content: `import type { Config } from "tailwindcss"
const config = {
  darkMode: ["class"],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))", background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-out": { "0%": { opacity: "1", transform: "translateY(0)" }, "100%": { opacity: "0", transform: "translateY(10px)" } },
        "scale-in": { "0%": { transform: "scale(0.95)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-out": "fade-out 0.5s ease-out forwards",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config; export default config;`
        },
        {
             path: "src/app/globals.css",
             content: `@tailwind base; @tailwind components; @tailwind utilities;
@layer base {
  :root { --background: 0 0% 100%; --foreground: 240 10% 3.9%; --card: 0 0% 100%; --card-foreground: 240 10% 3.9%; --popover: 0 0% 100%; --popover-foreground: 240 10% 3.9%; --primary: 240 5.9% 10%; --primary-foreground: 0 0% 98%; --secondary: 240 4.8% 95.9%; --secondary-foreground: 240 5.9% 10%; --muted: 240 4.8% 95.9%; --muted-foreground: 240 3.8% 46.1%; --accent: 240 4.8% 95.9%; --accent-foreground: 240 5.9% 10%; --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%; --border: 240 5.9% 90%; --input: 240 5.9% 90%; --ring: 240 10% 3.9%; --radius: 0.75rem; }
  .dark { --background: 240 10% 3.9%; --foreground: 0 0% 98%; --card: 240 10% 3.9%; --card-foreground: 0 0% 98%; --popover: 240 10% 3.9%; --popover-foreground: 0 0% 98%; --primary: 0 0% 98%; --primary-foreground: 240 5.9% 10%; --secondary: 240 3.7% 15.9%; --secondary-foreground: 0 0% 98%; --muted: 240 3.7% 15.9%; --muted-foreground: 240 5% 64.9%; --accent: 240 3.7% 15.9%; --accent-foreground: 0 0% 98%; --destructive: 0 62.8% 30.6%; --destructive-foreground: 0 0% 98%; --border: 240 3.7% 15.9%; --input: 240 3.7% 15.9%; --ring: 240 4.9% 83.9%; }
}
@layer base { * { @apply border-border; } body { @apply bg-background text-foreground min-h-screen font-body; } h1, h2, h3, h4, h5, h6 { @apply font-heading; } }`
        }
    ];

  // MANDATORY UI COMPONENTS (Fail-safe Injection)
  const MANDATORY_UI_COMPONENTS = [
    {
      path: "src/components/ui/button.tsx",
      content: `"use client"; import * as React from "react"; import { Slot } from "@radix-ui/react-slot"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline" }, size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" } }, defaultVariants: { variant: "default", size: "default" } }); export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean } const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} /> }); Button.displayName = "Button"; export { Button, buttonVariants }; export default Button;`
    },
    {
      path: "src/components/ui/card.tsx",
      content: `import * as React from "react"; import { cn } from "@/lib/utils"; const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />)); Card.displayName = "Card"; const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />)); CardHeader.displayName = "CardHeader"; const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (<h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />)); CardTitle.displayName = "CardTitle"; const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); CardDescription.displayName = "CardDescription"; const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />)); CardContent.displayName = "CardContent"; const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />)); CardFooter.displayName = "CardFooter"; export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }; export default Card;`
    },
    {
      path: "src/components/ui/input.tsx",
      content: `import * as React from "react"; import { cn } from "@/lib/utils"; export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {} const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => { return (<input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />); }); Input.displayName = "Input"; export { Input }; export default Input;`
    },
    {
        path: "src/components/ui/label.tsx",
        content: `"use client"; import * as React from "react"; import * as LabelPrimitive from "@radix-ui/react-label"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"); const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(({ className, ...props }, ref) => (<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />)); Label.displayName = LabelPrimitive.Root.displayName; export { Label }; export default Label;`
    },
    {
        path: "src/components/ui/accordion.tsx",
        content: `"use client"; import * as React from "react"; import * as AccordionPrimitive from "@radix-ui/react-accordion"; import { ChevronDown } from "lucide-react"; import { cn } from "@/lib/utils"; const Accordion = AccordionPrimitive.Root; const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => (<AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />)); AccordionItem.displayName = "AccordionItem"; const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (<AccordionPrimitive.Header className="flex"><AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>{children}<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>)); AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName; const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...props }, ref) => (<AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}><div className={cn("pb-4 pt-0", className)}>{children}</div></AccordionPrimitive.Content>)); AccordionContent.displayName = AccordionPrimitive.Content.displayName; export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }; export default Accordion;`
    },
    {
        path: "src/components/ui/avatar.tsx",
        content: `"use client"; import * as React from "react"; import * as AvatarPrimitive from "@radix-ui/react-avatar"; import { cn } from "@/lib/utils"; const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...props }, ref) => (<AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />)); Avatar.displayName = AvatarPrimitive.Root.displayName; const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, ...props }, ref) => (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />)); AvatarImage.displayName = AvatarPrimitive.Image.displayName; const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />)); AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName; export { Avatar, AvatarImage, AvatarFallback }; export default Avatar;`
    },
    {
        path: "src/components/ui/badge.tsx",
        content: `import * as React from "react"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", { variants: { variant: { default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80", outline: "text-foreground" } }, defaultVariants: { variant: "default" } }); export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {} function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; } export { Badge, badgeVariants }; export default Badge;`
    },
    {
        path: "src/components/ui/dialog.tsx",
        content: `"use client"; import * as React from "react"; import * as DialogPrimitive from "@radix-ui/react-dialog"; import { X } from "lucide-react"; import { cn } from "@/lib/utils"; const Dialog = DialogPrimitive.Root; const DialogTrigger = DialogPrimitive.Trigger; const DialogPortal = DialogPrimitive.Portal; const DialogClose = DialogPrimitive.Close; const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (<DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />)); DialogOverlay.displayName = DialogPrimitive.Overlay.displayName; const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (<DialogPortal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"><X className="h-4 w-4" /><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPortal>)); DialogContent.displayName = DialogPrimitive.Content.displayName; const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />); DialogHeader.displayName = "DialogHeader"; const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />); DialogFooter.displayName = "DialogFooter"; const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => (<DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />)); DialogTitle.displayName = DialogPrimitive.Title.displayName; const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => (<DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); DialogDescription.displayName = DialogPrimitive.Description.displayName; export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }; export default Dialog;`
    },
    {
        path: "src/components/ui/dropdown-menu.tsx",
        content: `"use client"; import * as React from "react"; import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"; import { Check, ChevronRight, Circle } from "lucide-react"; import { cn } from "@/lib/utils"; const DropdownMenu = DropdownMenuPrimitive.Root; const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger; const DropdownMenuGroup = DropdownMenuPrimitive.Group; const DropdownMenuPortal = DropdownMenuPrimitive.Portal; const DropdownMenuSub = DropdownMenuPrimitive.Sub; const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup; const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }>(({ className, inset, children, ...props }, ref) => (<DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent", inset && "pl-8", className)} {...props}>{children}<ChevronRight className="ml-auto h-4 w-4" /></DropdownMenuPrimitive.SubTrigger>)); DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName; const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(({ className, ...props }, ref) => (<DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />)); DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName; const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({ className, sideOffset = 4, ...props }, ref) => (<DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} /></DropdownMenuPrimitive.Portal>)); DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName; const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />)); DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName; const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />)); DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName; const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({ className, ...props }, ref) => (<DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />)); DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName; export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup }; export default DropdownMenu;`
    },
    {
        path: "src/components/ui/separator.tsx",
        content: `"use client"; import * as React from "react"; import * as SeparatorPrimitive from "@radix-ui/react-separator"; import { cn } from "@/lib/utils"; const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({ className, orientation = "horizontal", ...props }, ref) => (<SeparatorPrimitive.Root ref={ref} decorative orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />)); Separator.displayName = SeparatorPrimitive.Root.displayName; export { Separator }; export default Separator;`
    },
    {
        path: "src/components/ui/scroll-area.tsx",
        content: `"use client"; import * as React from "react"; import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"; import { cn } from "@/lib/utils"; const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({ className, children, ...props }, ref) => (<ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}><ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport><ScrollBar /></ScrollAreaPrimitive.Root>)); ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName; const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({ className, orientation = "vertical", ...props }, ref) => (<ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}><ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" /></ScrollAreaPrimitive.ScrollAreaScrollbar>)); ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName; export { ScrollArea, ScrollBar }; export default ScrollArea;`
    },
    {
        path: "src/components/ui/switch.tsx",
        content: `"use client"; import * as React from "react"; import * as SwitchPrimitive from "@radix-ui/react-switch"; import { cn } from "@/lib/utils"; const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(({ className, ...props }, ref) => (<SwitchPrimitive.Root className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} {...props} ref={ref}><SwitchPrimitive.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")} /></SwitchPrimitive.Root>)); Switch.displayName = SwitchPrimitive.Root.displayName; export { Switch }; export default Switch;`
    },
    {
        path: "src/components/ui/textarea.tsx",
        content: `import * as React from "react"; import { cn } from "@/lib/utils"; export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {} const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => { return (<textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />); }); Textarea.displayName = "Textarea"; export { Textarea }; export default Textarea;`
    },
    {
        path: "src/components/ui/tabs.tsx",
        content: `"use client"; import * as React from "react"; import * as TabsPrimitive from "@radix-ui/react-tabs"; import { cn } from "@/lib/utils"; const Tabs = TabsPrimitive.Root; const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (<TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />)); TabsList.displayName = TabsPrimitive.List.displayName; const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => (<TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />)); TabsTrigger.displayName = TabsPrimitive.Trigger.displayName; const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (<TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />)); TabsContent.displayName = TabsPrimitive.Content.displayName; export { Tabs, TabsList, TabsTrigger, TabsContent }; export default Tabs;`
    },
    {
        path: "src/components/ui/select.tsx",
        content: `"use client"; import * as React from "react"; import * as SelectPrimitive from "@radix-ui/react-select"; import { Check, ChevronDown, ChevronUp } from "lucide-react"; import { cn } from "@/lib/utils"; const Select = SelectPrimitive.Root; const SelectGroup = SelectPrimitive.Group; const SelectValue = SelectPrimitive.Value; const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (<SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="h-4 w-4 opacity-50" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>)); SelectTrigger.displayName = SelectPrimitive.Trigger.displayName; const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(({ className, ...props }, ref) => (<SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronUp className="h-4 w-4" /></SelectPrimitive.ScrollUpButton>)); SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName; const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(({ className, ...props }, ref) => (<SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronDown className="h-4 w-4" /></SelectPrimitive.ScrollDownButton>)); SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName; const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => (<SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}><SelectScrollUpButton /><SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>{children}</SelectPrimitive.Viewport><SelectScrollDownButton /></SelectPrimitive.Content></SelectPrimitive.Portal>)); SelectContent.displayName = SelectPrimitive.Content.displayName; const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(({ className, ...props }, ref) => (<SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />)); SelectLabel.displayName = SelectPrimitive.Label.displayName; const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (<SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>)); SelectItem.displayName = SelectPrimitive.Item.displayName; const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(({ className, ...props }, ref) => (<SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />)); SelectSeparator.displayName = SelectPrimitive.Separator.displayName; export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton }; export default Select;`
    },
    {
        path: "src/components/ui/sheet.tsx",
        content: `"use client"; import * as React from "react"; import * as SheetPrimitive from "@radix-ui/react-dialog"; import { cva, type VariantProps } from "class-variance-authority"; import { X } from "lucide-react"; import { cn } from "@/lib/utils"; const Sheet = SheetPrimitive.Root; const SheetTrigger = SheetPrimitive.Trigger; const SheetClose = SheetPrimitive.Close; const SheetPortal = SheetPrimitive.Portal; const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(({ className, ...props }, ref) => (<SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />)); SheetOverlay.displayName = SheetPrimitive.Overlay.displayName; const sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500", { variants: { side: { top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm" } }, defaultVariants: { side: "right" } }); interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {} const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(({ side = "right", className, children, ...props }, ref) => (<SheetPortal><SheetOverlay /><SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}><SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"><X className="h-4 w-4" /><span className="sr-only">Close</span></SheetPrimitive.Close>{children}</SheetPrimitive.Content></SheetPortal>)); SheetContent.displayName = SheetPrimitive.Content.displayName; const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />); SheetHeader.displayName = "SheetHeader"; const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />); SheetFooter.displayName = "SheetFooter"; const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(({ className, ...props }, ref) => (<SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />)); SheetTitle.displayName = SheetPrimitive.Title.displayName; const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(({ className, ...props }, ref) => (<SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); SheetDescription.displayName = SheetPrimitive.Description.displayName; export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }; export default Sheet;`
    }
  ];

  // Declare variables OUTSIDE the try block to avoid ReferenceError
  let prompt = "Portfolio";
  let plan = { sql: "", description: "Standard" };
  let currentFiles: any[] = [];
  let image: string | null = null;

  try {
    try {
        const body = await req.json();
        
        if (body.prompt && typeof body.prompt === 'string') {
             prompt = body.prompt;
        }
        
        plan = body.plan || plan;
        currentFiles = body.currentFiles || [];
        // FIX: Handle image being null or undefined
        image = body.image && body.image.startsWith("data:") ? body.image : null; 
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 2. CHECK API KEY
    if (!process.env.OPENAI_API_KEY) {
         return NextResponse.json(
            { error: "OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env.local file." },
            { status: 500 }
         );
    }

    // Determine Mode: Full Generation vs Magic Edit
    const isMagicEdit = !!currentFiles.length && prompt.length > 0;
    
    // --- 3. DYNAMIC PERSONA SELECTION ---
    // If user specifies a style, use it. Otherwise, ROLL THE DICE.
    let selectedPersona = DESIGN_PERSONAS.find(p => prompt.toLowerCase().includes(p.id)) || 
                          DESIGN_PERSONAS[Math.floor(Math.random() * DESIGN_PERSONAS.length)];

    // Force specific personas for keywords
    if (prompt.toLowerCase().includes("shop") || prompt.toLowerCase().includes("ecommerce")) {
        selectedPersona = DESIGN_PERSONAS.find(p => p.id === "minimal")!;
    }
    if (prompt.toLowerCase().includes("dashboard") || prompt.toLowerCase().includes("saas")) {
        selectedPersona = DESIGN_PERSONAS.find(p => p.id === "corporate")!;
    }

    console.log(`[CODEGEN] Selected Persona: ${selectedPersona.name}`);

    const systemPrompt = `
    You are a Full-stack Web Engineer and Senior UI/UX Designer.
    Your mission is to transform this platform into a "Lovable-Tier" or "V0-Tier" generator.
    
    --------------------------------------------------------------------------------
    ### 1. DESIGN SYSTEM: PREMIUM & HIGH-END (MANDATORY)
    You MUST adhere to these "Super Prompt" standards:
    
    **A. Modern Aesthetic (Minimalism):**
    - Use a clean, whitespace-dominant layout.
    - **Typography:** Use modern sans-serif fonts (Inter, Geist, Outfit).
    - **Hierarchy:** Bold, large headings (text-4xl/5xl). Subtle text-muted-foreground for secondary info.
    
    **B. Color Palette (Subtle & Refined):**
    - **NO** pure red/blue/green. Use **Slate**, **Zinc**, or **Gray** for neutrals.
    - **Accents:** Use sophisticated accents like Indigo-600, Violet-600, or Emerald-600.
    - **Backgrounds:** Use subtle gradients (\`bg-gradient-to-b from-white to-slate-50\`) instead of flat colors.
    
    **C. Shadows & Borders (Soft & Smooth):**
    - **NO** harsh black borders (\`border-black\`). Use \`border-slate-200\` or \`border-zinc-800\` (dark).
    - **Shadows:** Use \`shadow-sm\`, \`shadow-md\`, or \`shadow-xl\` (soft diffuse).
    - **Radius:** Use \`rounded-xl\` or \`rounded-2xl\` for cards and buttons.
    
    --------------------------------------------------------------------------------
    ### 2. ZERO-COST UI LIBRARY (CRITICAL: USE THESE)
    The following components are **PRE-INSTALLED**. DO NOT GENERATE THEM. IMPORT THEM.
    - \`import { Button } from "@/components/ui/button"\`
    - \`import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"\`
    - \`import { Input } from "@/components/ui/input"\`
    - \`import { Label } from "@/components/ui/label"\`
    - \`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"\`
    - \`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"\`
    - \`import { Badge } from "@/components/ui/badge"\`
    - \`import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"\`
    - \`import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"\`
    - \`import { Separator } from "@/components/ui/separator"\`
    - \`import { ScrollArea } from "@/components/ui/scroll-area"\`
    - \`import { Switch } from "@/components/ui/switch"\`
    - \`import { Textarea } from "@/components/ui/textarea"\`
    - \`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"\`
    - \`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"\`
    - \`import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"\`
    
    **ICONS:** Use \`lucide-react\` freely. Example: \`import { Rocket, Zap } from "lucide-react";\`
    
    --------------------------------------------------------------------------------
    ### 3. ASSIGNED DESIGN PERSONA: "${selectedPersona.name}"
    - **Vibe**: ${selectedPersona.description}
    - **CSS Base**: ${selectedPersona.css}
    - **Component Style**: ${selectedPersona.components}
    
    --------------------------------------------------------------------------------
    ### 4. ARCHITECTURE & STABILITY (MOBILE-FIRST)
    - **Mobile-First:** Use \`grid-cols-1 md:grid-cols-3\` or \`flex-col md:flex-row\`.
    - **Modular:** Split code into small, manageable components in \`src/components/...\`.
    - **Error Boundaries:** Use optional chaining (\`user?.name\`) to prevent crashes.
    
    **MANDATORY FILE STRUCTURE**:
    1. \`src/app/page.tsx\` (Landing Page)
    2. \`src/app/layout.tsx\` (Root Layout)
    3. \`src/components/ui/navbar.tsx\`
    4. \`src/components/ui/footer.tsx\`
    5. \`src/components/landing/hero.tsx\`
    6. \`src/components/landing/features.tsx\`
    ... (Add other sections as needed)
    
    --------------------------------------------------------------------------------
    ### 5. INTERACTIVITY (The "Alive" Factor)
    - Use \`framer-motion\` for entrance animations (\`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}\`).
    - Add hover effects to cards and buttons (\`hover:-translate-y-1 hover:shadow-lg transition-all duration-300\`).
    
    --------------------------------------------------------------------------------
    ### 6. IMAGES (Unsplash)
    - Use \`<img src="..." />\` with high-quality Unsplash URLs.
    - Keywords: Abstract, Tech, Minimal, Office, Nature.
    
    --------------------------------------------------------------------------------
    **RETURN FORMAT**: JSON object with a "files" array.
    `;

    // 3. CALL OPENAI (With Retry & Timeout)
    console.log("[CODEGEN] Calling OpenAI...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // RETRY LOGIC
    let attempts = 0;
    const MAX_RETRIES = 2;
    let lastError: any = null;

    while (attempts < MAX_RETRIES) {
        attempts++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s (3min) Timeout per attempt

        try {
            console.log(`[CODEGEN] Attempt ${attempts}...`);
            
            // CONSTRUCT MESSAGES FOR GPT-4o VISION
            const userContent: any[] = [{ type: "text", text: `Prompt: ${prompt}\n\nPlan: ${plan.description}\n\nREMEMBER: You are the "${selectedPersona.name}" Persona. DESIGN ACCORDINGLY.` }];
            
            if (image) {
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: image, // Base64 or URL
                    }
                });
                console.log("[CODEGEN] Image attached to prompt");
            }

            const completion = await openai.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent as any },
                // RANDOM SEED to force variety in code structure
                { role: "system", content: `SEED: ${Date.now()}-${Math.random()}-FORCE_VARIATION` }
              ],
              model: "gpt-4o",
              response_format: { type: "json_object" },
              "temperature": 1.0, // MAXIMUM CREATIVITY
              "top_p": 1.0,
            }, { signal: controller.signal });

            clearTimeout(timeoutId);
            let content = completion.choices[0].message.content;
            const finishReason = completion.choices[0].finish_reason;

            if (!content) throw new Error("No content from OpenAI");
            
            // 4. PARSE & PROCESS
            let result;
            try {
                result = JSON.parse(content);
            } catch (parseError) {
                console.warn(`[CODEGEN] JSON Parse Failed (Reason: ${finishReason}). Attempting repair...`);
                try {
                    const repaired = jsonrepair(content);
                    result = JSON.parse(repaired);
                    console.log("[CODEGEN] JSON Repaired Successfully.");
                } catch (repairError) {
                    console.error("[CODEGEN] JSON Repair Failed:", repairError);
                    throw new Error("JSON Parse Error");
                }
            }
            
            // Normalize paths
            if (!result.files || !Array.isArray(result.files)) {
                 if (result.project && result.project.files) result.files = result.project.files;
                 else throw new Error("Missing 'files' array in response");
            }

            result.files = result.files.map((file: any) => {
                if (!file || !file.path) return file;
                if (file.content) {
                    file.content = file.content.replace(/from ['"]@components\//g, 'from "@/components/');
                    file.content = file.content.replace(/from ['"]@lib\//g, 'from "@/lib/');
                }
                if (file.path.startsWith('/')) file.path = file.path.substring(1);
                if (file.path === 'page.tsx') file.path = 'src/app/page.tsx';
                if (file.path.startsWith("app/")) file.path = "src/" + file.path;
                if (file.path.startsWith("components/")) file.path = "src/" + file.path;
                if (file.path.startsWith("lib/")) file.path = "src/" + file.path;
                return file;
            });

            // Inject Config Files (Ensure Boilerplate is present)
            if (!isMagicEdit) {
                CONFIG_FILES.forEach(configFile => {
                    const existingIndex = result.files.findIndex((f: any) => f.path === configFile.path);
                    if (existingIndex !== -1) {
                        result.files[existingIndex] = configFile;
                    } else {
                        result.files.unshift(configFile);
                    }
                });
            }

            // Inject Mandatory UI Components (Fail-safe for Magic Edit too)
            MANDATORY_UI_COMPONENTS.forEach(uiComponent => {
                const exists = result.files.some((f: any) => f.path === uiComponent.path);
                // ALWAYS inject if missing, even in Magic Edit, to prevent "Element type is invalid" crashes
                if (!exists) {
                    result.files.push(uiComponent);
                }
            });

            console.log("[CODEGEN] Success. Files:", result.files.length);
            return NextResponse.json({ files: result.files, partial: isMagicEdit });

        } catch (innerError: any) {
            clearTimeout(timeoutId);
            console.error(`[CODEGEN] Attempt ${attempts} failed:`, innerError);
            lastError = innerError;
        }
    }

    const errorMessage = lastError?.message || "Unknown Error";
    return NextResponse.json(
        { error: `Generation failed: ${errorMessage}. The AI Architect is currently overloaded or encountered an error.` }, 
        { status: 500 }
    );

  } catch (fatalError: any) {
    console.error("[CODEGEN] Fatal Error:", fatalError);
    return NextResponse.json(
        { error: "Internal Server Error" }, 
        { status: 500 }
    );
  }
}
