import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';

export const maxDuration = 300;

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
             path: "tailwind.config.ts",
             content: `import type { Config } from "tailwindcss"
const config = {
  darkMode: ["class"],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config; export default config;`
        },
        {
             path: "src/app/globals.css",
             content: `@tailwind base; @tailwind components; @tailwind utilities;
@layer base {
  :root { --background: 0 0% 100%; --foreground: 222.2 84% 4.9%; --card: 0 0% 100%; --card-foreground: 222.2 84% 4.9%; --popover: 0 0% 100%; --popover-foreground: 222.2 84% 4.9%; --primary: 222.2 47.4% 11.2%; --primary-foreground: 210 40% 98%; --secondary: 210 40% 96.1%; --secondary-foreground: 222.2 47.4% 11.2%; --muted: 210 40% 96.1%; --muted-foreground: 215.4 16.3% 46.9%; --accent: 210 40% 96.1%; --accent-foreground: 222.2 47.4% 11.2%; --destructive: 0 84.2% 60.2%; --destructive-foreground: 210 40% 98%; --border: 214.3 31.8% 91.4%; --input: 214.3 31.8% 91.4%; --ring: 222.2 84% 4.9%; --radius: 0.5rem; }
  .dark { --background: 222.2 84% 4.9%; --foreground: 210 40% 98%; --card: 222.2 84% 4.9%; --card-foreground: 210 40% 98%; --popover: 222.2 84% 4.9%; --popover-foreground: 210 40% 98%; --primary: 210 40% 98%; --primary-foreground: 222.2 47.4% 11.2%; --secondary: 217.2 32.6% 17.5%; --secondary-foreground: 210 40% 98%; --muted: 217.2 32.6% 17.5%; --muted-foreground: 215 20.2% 65.1%; --accent: 217.2 32.6% 17.5%; --accent-foreground: 210 40% 98%; --destructive: 0 62.8% 30.6%; --destructive-foreground: 210 40% 98%; --border: 217.2 32.6% 17.5%; --input: 217.2 32.6% 17.5%; --ring: 212.7 26.8% 83.9%; }
}
@layer base { * { @apply border-border; } body { @apply bg-background text-foreground min-h-screen; } }`
        }
    ];

  // MANDATORY UI COMPONENTS (Fail-safe Injection)
  // This massive injection ensures "Zero Config" and "Zero Errors" for standard UI.
  // It also saves massive API costs by preventing the AI from regenerating standard UI.
  const MANDATORY_UI_COMPONENTS = [
    {
      path: "src/components/ui/button.tsx",
      content: `"use client"; import * as React from "react"; import { Slot } from "@radix-ui/react-slot"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline" }, size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" } }, defaultVariants: { variant: "default", size: "default" } }); export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean } const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} /> }); Button.displayName = "Button"; export { Button, buttonVariants };`
    },
    {
      path: "src/components/ui/card.tsx",
      content: `import * as React from "react"; import { cn } from "@/lib/utils"; const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />)); Card.displayName = "Card"; const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />)); CardHeader.displayName = "CardHeader"; const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (<h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />)); CardTitle.displayName = "CardTitle"; const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); CardDescription.displayName = "CardDescription"; const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />)); CardContent.displayName = "CardContent"; const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />)); CardFooter.displayName = "CardFooter"; export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };`
    },
    {
      path: "src/components/ui/input.tsx",
      content: `import * as React from "react"; import { cn } from "@/lib/utils"; export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {} const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => { return (<input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />); }); Input.displayName = "Input"; export { Input };`
    },
    {
        path: "src/components/ui/label.tsx",
        content: `"use client"; import * as React from "react"; import * as LabelPrimitive from "@radix-ui/react-label"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"); const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(({ className, ...props }, ref) => (<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />)); Label.displayName = LabelPrimitive.Root.displayName; export { Label };`
    },
    {
        path: "src/components/ui/accordion.tsx",
        content: `"use client"; import * as React from "react"; import * as AccordionPrimitive from "@radix-ui/react-accordion"; import { ChevronDown } from "lucide-react"; import { cn } from "@/lib/utils"; const Accordion = AccordionPrimitive.Root; const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({ className, ...props }, ref) => (<AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />)); AccordionItem.displayName = "AccordionItem"; const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({ className, children, ...props }, ref) => (<AccordionPrimitive.Header className="flex"><AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>{children}<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>)); AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName; const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({ className, children, ...props }, ref) => (<AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}><div className={cn("pb-4 pt-0", className)}>{children}</div></AccordionPrimitive.Content>)); AccordionContent.displayName = AccordionPrimitive.Content.displayName; export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };`
    },
    {
        path: "src/components/ui/avatar.tsx",
        content: `"use client"; import * as React from "react"; import * as AvatarPrimitive from "@radix-ui/react-avatar"; import { cn } from "@/lib/utils"; const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...props }, ref) => (<AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />)); Avatar.displayName = AvatarPrimitive.Root.displayName; const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, ...props }, ref) => (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />)); AvatarImage.displayName = AvatarPrimitive.Image.displayName; const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />)); AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName; export { Avatar, AvatarImage, AvatarFallback };`
    },
    {
        path: "src/components/ui/badge.tsx",
        content: `import * as React from "react"; import { cva, type VariantProps } from "class-variance-authority"; import { cn } from "@/lib/utils"; const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", { variants: { variant: { default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80", outline: "text-foreground" } }, defaultVariants: { variant: "default" } }); export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {} function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; } export { Badge, badgeVariants };`
    },
    {
        path: "src/components/ui/dialog.tsx",
        content: `"use client"; import * as React from "react"; import * as DialogPrimitive from "@radix-ui/react-dialog"; import { X } from "lucide-react"; import { cn } from "@/lib/utils"; const Dialog = DialogPrimitive.Root; const DialogTrigger = DialogPrimitive.Trigger; const DialogPortal = DialogPrimitive.Portal; const DialogClose = DialogPrimitive.Close; const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (<DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />)); DialogOverlay.displayName = DialogPrimitive.Overlay.displayName; const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (<DialogPortal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"><X className="h-4 w-4" /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPortal>)); DialogContent.displayName = DialogPrimitive.Content.displayName; const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />); DialogHeader.displayName = "DialogHeader"; const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />); DialogFooter.displayName = "DialogFooter"; const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => (<DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />)); DialogTitle.displayName = DialogPrimitive.Title.displayName; const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => (<DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); DialogDescription.displayName = DialogPrimitive.Description.displayName; export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };`
    },
    {
        path: "src/components/ui/dropdown-menu.tsx",
        content: `"use client"; import * as React from "react"; import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"; import { Check, ChevronRight, Circle } from "lucide-react"; import { cn } from "@/lib/utils"; const DropdownMenu = DropdownMenuPrimitive.Root; const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger; const DropdownMenuGroup = DropdownMenuPrimitive.Group; const DropdownMenuPortal = DropdownMenuPrimitive.Portal; const DropdownMenuSub = DropdownMenuPrimitive.Sub; const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup; const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }>(({ className, inset, children, ...props }, ref) => (<DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent", inset && "pl-8", className)} {...props}>{children}<ChevronRight className="ml-auto h-4 w-4" /></DropdownMenuPrimitive.SubTrigger>)); DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName; const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(({ className, ...props }, ref) => (<DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />)); DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName; const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({ className, sideOffset = 4, ...props }, ref) => (<DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} /></DropdownMenuPrimitive.Portal>)); DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName; const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />)); DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName; const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(({ className, children, checked, ...props }, ref) => (<DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}><span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><Check className="h-4 w-4" /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.CheckboxItem>)); DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName; const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(({ className, children, ...props }, ref) => (<DropdownMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><Circle className="h-2 w-2 fill-current" /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.RadioItem>)); DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName; const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }>(({ className, inset, ...props }, ref) => (<DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />)); DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName; const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({ className, ...props }, ref) => (<DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />)); DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName; const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (<span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />); DropdownMenuShortcut.displayName = "DropdownMenuShortcut"; export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup };`
    },
    {
        path: "src/components/ui/separator.tsx",
        content: `"use client"; import * as React from "react"; import * as SeparatorPrimitive from "@radix-ui/react-separator"; import { cn } from "@/lib/utils"; const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({ className, orientation = "horizontal", ...props }, ref) => (<SeparatorPrimitive.Root ref={ref} decorative orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />)); Separator.displayName = SeparatorPrimitive.Root.displayName; export { Separator };`
    },
    {
        path: "src/components/ui/scroll-area.tsx",
        content: `"use client"; import * as React from "react"; import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"; import { cn } from "@/lib/utils"; const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({ className, children, ...props }, ref) => (<ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}><ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport><ScrollBar /></ScrollAreaPrimitive.Root>)); ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName; const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({ className, orientation = "vertical", ...props }, ref) => (<ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}><ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" /></ScrollAreaPrimitive.ScrollAreaScrollbar>)); ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName; export { ScrollArea, ScrollBar };`
    },
    {
        path: "src/components/ui/switch.tsx",
        content: `"use client"; import * as React from "react"; import * as SwitchPrimitive from "@radix-ui/react-switch"; import { cn } from "@/lib/utils"; const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(({ className, ...props }, ref) => (<SwitchPrimitive.Root className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} {...props} ref={ref}><SwitchPrimitive.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")} /></SwitchPrimitive.Root>)); Switch.displayName = SwitchPrimitive.Root.displayName; export { Switch };`
    },
    {
        path: "src/components/ui/textarea.tsx",
        content: `import * as React from "react"; import { cn } from "@/lib/utils"; export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {} const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => { return (<textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />); }); Textarea.displayName = "Textarea"; export { Textarea };`
    },
    {
        path: "src/components/ui/tabs.tsx",
        content: `"use client"; import * as React from "react"; import * as TabsPrimitive from "@radix-ui/react-tabs"; import { cn } from "@/lib/utils"; const Tabs = TabsPrimitive.Root; const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (<TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />)); TabsList.displayName = TabsPrimitive.List.displayName; const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => (<TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />)); TabsTrigger.displayName = TabsPrimitive.Trigger.displayName; const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (<TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />)); TabsContent.displayName = TabsPrimitive.Content.displayName; export { Tabs, TabsList, TabsTrigger, TabsContent };`
    },
    {
        path: "src/components/ui/select.tsx",
        content: `"use client"; import * as React from "react"; import * as SelectPrimitive from "@radix-ui/react-select"; import { Check, ChevronDown, ChevronUp } from "lucide-react"; import { cn } from "@/lib/utils"; const Select = SelectPrimitive.Root; const SelectGroup = SelectPrimitive.Group; const SelectValue = SelectPrimitive.Value; const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (<SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="h-4 w-4 opacity-50" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>)); SelectTrigger.displayName = SelectPrimitive.Trigger.displayName; const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(({ className, ...props }, ref) => (<SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronUp className="h-4 w-4" /></SelectPrimitive.ScrollUpButton>)); SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName; const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(({ className, ...props }, ref) => (<SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronDown className="h-4 w-4" /></SelectPrimitive.ScrollDownButton>)); SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName; const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => (<SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:translate-y-1", className)} position={position} {...props}><SelectScrollUpButton /><SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>{children}</SelectPrimitive.Viewport><SelectScrollDownButton /></SelectPrimitive.Content></SelectPrimitive.Portal>)); SelectContent.displayName = SelectPrimitive.Content.displayName; const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(({ className, ...props }, ref) => (<SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />)); SelectLabel.displayName = SelectPrimitive.Label.displayName; const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (<SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>)); SelectItem.displayName = SelectPrimitive.Item.displayName; const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(({ className, ...props }, ref) => (<SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />)); SelectSeparator.displayName = SelectPrimitive.Separator.displayName; export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton };`
    },
    {
        path: "src/components/ui/sheet.tsx",
        content: `"use client"; import * as React from "react"; import * as SheetPrimitive from "@radix-ui/react-dialog"; import { cva, type VariantProps } from "class-variance-authority"; import { X } from "lucide-react"; import { cn } from "@/lib/utils"; const Sheet = SheetPrimitive.Root; const SheetTrigger = SheetPrimitive.Trigger; const SheetClose = SheetPrimitive.Close; const SheetPortal = SheetPrimitive.Portal; const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(({ className, ...props }, ref) => (<SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />)); SheetOverlay.displayName = SheetPrimitive.Overlay.displayName; const sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500", { variants: { side: { top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm" } }, defaultVariants: { side: "right" } }); interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {} const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(({ side = "right", className, children, ...props }, ref) => (<SheetPortal><SheetOverlay /><SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>{children}<SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"><X className="h-4 w-4" /><span className="sr-only">Close</span></SheetPrimitive.Close></SheetPrimitive.Content></SheetPortal>)); SheetContent.displayName = SheetPrimitive.Content.displayName; const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />); SheetHeader.displayName = "SheetHeader"; const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />); SheetFooter.displayName = "SheetFooter"; const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(({ className, ...props }, ref) => (<SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />)); SheetTitle.displayName = SheetPrimitive.Title.displayName; const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(({ className, ...props }, ref) => (<SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)); SheetDescription.displayName = SheetPrimitive.Description.displayName; export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };`
    }
  ];

  const systemPrompt = `
    You are an ELITE Creative Technologist and Senior Frontend Architect.

    --------------------------------------------------------------------------------
    ### 0. ZERO-COST UI LIBRARY (CRITICAL: DO NOT GENERATE THESE)
    The following components are **PRE-INSTALLED** in the environment.
    You MUST NOT generate code for them. You MUST NOT import them from \`lucide-react\` or other places.
    **JUST IMPORT THEM from \`@/components/ui/...\` and USE THEM.**

    **AVAILABLE COMPONENTS:**
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

    **RULE**: Focus your token budget on **Business Logic**, **Layout**, and **Custom Components**.
    **RULE**: NEVER generate a file like \`src/components/ui/button.tsx\`. It already exists.
    --------------------------------------------------------------------------------

    Your work mimics the quality of Apple, Stripe, Linear, and Vercel. You are here to OUTPERFORM "The Competition" by a factor of 10.

    **MISSION**: Generate a PRODUCTION-READY, HIGH-PERFORMANCE Next.js 14 Application.
    **PHILOSOPHY**: "Anti-Minimalism" in execution, "Minimalism" in feeling. Every pixel must have purpose and depth. No "half-baked" or "skeleton" code.
    **BENCHMARK**: You must replicate the quality of "crackwriting.com" and "linear.app". 
    - **Visual Style**: High contrast, subtle noise textures, sophisticated typography (Inter/Geist), and "Bento Grid" layouts.
    - **Micro-interactions**: Everything must react to the cursor. Glow effects, border shines, and smooth scaling are MANDATORY.
    - **Deep Domain Specificity**: If the user asks for "IELTS", generate a "Band Score Calculator". If "Crypto", generate a "Live Trading Chart".
    - **Rich Footers**: 4+ columns with newsletter signup.
    - **Authentic Content**: No "Lorem Ipsum". Use real-world copy.

    --------------------------------------------------------------------------------
    ### 1. THE "VIBE" ENGINE (Design Persona)
    You MUST adopt one of these personas based on the user's prompt. Do not ask, just choose and execute.

    A. **The "Futurist" (Cyberpunk/Web3/AI)**:
       - **Palette**: Zinc-950 background, Neon Purple/Blue accents (#6366f1, #d946ef).
       - **Key Element**: "Spotlight" effects (using radial-gradient) on cards.
       - **Borders**: Glassmorphism (border-white/10) with subtle inner glow.
       - **Font**: Sans-serif (Inter) with uppercase tracking-widest headers.

    B. **The "Swiss" (Brutalist/Fashion/Portfolio)**:
       - **Palette**: Stark White (#ffffff) or Pitch Black (#000000). High contrast.
       - **Key Element**: Massive typography (text-8xl), thick borders (border-2 border-black), asymmetrical grids.
       - **Layout**: Rule-breaking, bold, artistic.

    C. **The "Corporate" (SaaS/Fintech/Enterprise)**:
       - **Palette**: Slate-50 background, Blue-600 accents. Clean, trustworthy, "Linear-like".
       - **Key Element**: Subtle shadows (shadow-xl), rounded-2xl corners, perfect whitespace.
       - **Data**: Dense information density but clean presentation.

    --------------------------------------------------------------------------------
    ### 2. ARCHITECTURE & FILE STRUCTURE (The "10x Engineer" Standard)
    You are a Senior Architect. Do NOT dump code into one file. Split logic intelligently.

    **MANDATORY FILE STRUCTURE**:
    1. \`src/app/page.tsx\` -> The Composition Layer. Imports ALL sections.
    2. \`src/app/layout.tsx\` -> Global layout (Fonts, Toaster).
    3. \`src/components/ui/navbar.tsx\` -> Sticky, glassmorphism navbar with functional links.
    4. \`src/components/ui/footer.tsx\` -> Rich footer with columns, newsletter, and social links.
    5. \`src/components/landing/hero.tsx\` -> The "Wow" Factor (H1, Subtext, 2 CTAs, Image/Video).
    6. \`src/components/landing/features.tsx\` -> Bento Grid or Interactive Cards (Hover effects).
    7. \`src/components/landing/how-it-works.tsx\` -> Step-by-step visual guide.
    8. \`src/components/landing/testimonials.tsx\` -> Carousel or Grid of user reviews.
    9. \`src/components/landing/pricing.tsx\` -> Pricing cards with "Most Popular" highlight.
    10. \`src/components/landing/faq.tsx\` -> Accordion for common questions.
    11. \`src/components/landing/cta.tsx\` -> Final conversion push.
    12. \`src/components/ui/button.tsx\` -> Reusable button component.
    13. \`src/components/ui/accordion.tsx\` -> For FAQ.

    **RULE**: Unless the user specifically asks for a "single component", you MUST generate a FULL LANDING PAGE with ALL the above sections.

    **EXCEPTION FOR WEB APPS (SaaS/Dashboards)**:
    If the user describes a functional app (e.g., "AI Writer", "Dashboard", "IELTS Tool"), you MUST **ALSO** generate:
    1.  \`src/app/dashboard/layout.tsx\` -> Sidebar + Top Navigation.
    2.  \`src/app/dashboard/page.tsx\` -> Main dashboard view (Stats, Recent Activity).
    3.  \`src/components/dashboard/sidebar.tsx\` -> Collapsible sidebar with Lucide icons.
    4.  \`src/components/dashboard/editor.tsx\` (or relevant tool) -> The core feature (e.g., Text Editor for writing apps).
    --------------------------------------------------------------------------------
    ### 3. INTERACTIVITY & ANIMATION (The "Alive" Factor)
    A static website is a broken website. You MUST use \`framer-motion\` everywhere.

    1.  **Entrance Animations**:
        - Use \`initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}\` for SECTIONS.
        - Use \`staggerChildren\` for lists/grids.

    2.  **Micro-Interactions (CRITICAL)**:
        - **Buttons**: \`whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}\`.
        - **Cards**: Hovering should trigger a border color change, a glow, or a slight lift (\`y: -5\`).
        - **Inputs**: Focus rings must be distinct (\`ring-2 ring-indigo-500\`).

    3.  **Functional Buttons (NO DEAD CLICKS)**:
        - NEVER leave an \`onClick\` empty.
        - **Primary Actions**: Trigger a real state change or a specific \`toast.success("Action completed!")\`.
        - **Secondary Actions**: \`toast.info("Feature coming soon!")\`.
        - **Navigation**: Use \`onClick={() => document.getElementById('section-id')?.scrollIntoView()}\`.

    --------------------------------------------------------------------------------
    ### 4. VISUAL POLISH (Anti-Sloppiness)
    - **Backgrounds**: NEVER plain colors. Use:
      - \`bg-grid-white/[0.02]\` (Grid patterns)
      - \`bg-dot-white/[0.05]\` (Dot patterns)
      - \`bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]\`
    - **Glassmorphism**: \`backdrop-blur-xl bg-white/5 border border-white/10\`.
    - **Icons**: Use \`lucide-react\` for EVERYTHING. Every button needs an icon.
    - **Images (CRITICAL RULE)**:
      - **NEVER** import local images (e.g., \`import img from "@/public/hero.png"\`). THESE DO NOT EXIST.
      - **ALWAYS** use standard \`<img src="..." />\` tags or \`<div className="bg-[url(/path/to/image)]" />\`.
      - **SOURCE**: Use high-quality Unsplash URLs.
        - Abstract/Tech: \`https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800\`
        - Minimal: \`https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800\`
        - Business: \`https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800\`

    --------------------------------------------------------------------------------
    ### 5. CONTENT & REALISM
    - **Copywriting**: Write persuasive, professional copy. NO "Lorem Ipsum".
    - **Real Data**: If generating a dashboard, mock real numbers ($45,231.89), not (0, 0, 0).
    - **Context-Aware**: If "Coffee Shop", generate "MenuSection", not "Features".
    - **Data Visualization**: You have \`recharts\` installed. Use it for ANY data dashboard.
      - Example: \`<ResponsiveContainer width="100%" height={350}><LineChart ... /></ResponsiveContainer>\`
    - **Interactive Elements**:
      - Use **Accordion** for FAQs.
      - Use **Tabs** for Feature switching.
      - Use **Hover Cards** for deep dives.

    --------------------------------------------------------------------------------
    ### 6. EXAMPLE COMPONENT (The Standard)

    **\`src/components/landing/hero.tsx\`**:
    \`\`\`tsx
    "use client";
    import { motion } from "framer-motion";
    import { ArrowRight, Sparkles } from "lucide-react";
    import { Button } from "@/components/ui/button";

    export function Hero() {
      return (
         // ... content
      )
    }
    \`\`\`

    --------------------------------------------------------------------------------
    ### 7. COMPONENT CHEAT SHEET & STRICT IMPORT RULES
    You have access to a pre-built UI library at \`@/components/ui\`.
    
    **MANDATORY IMPORTS (Do NOT forget these)**:
    - Button: \`import { Button } from "@/components/ui/button"\`
    - Card: \`import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"\`
    - Input: \`import { Input } from "@/components/ui/input"\`
    - Badge: \`import { Badge } from "@/components/ui/badge"\`
    - Avatar: \`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"\`
    - ScrollArea: \`import { ScrollArea } from "@/components/ui/scroll-area"\`
    
    **RULE**: If you use a JSX element like \`<Button>\`, you **MUST** write the import statement at the top.
    **RULE**: NEVER assume a component is global.
    **RULE**: Use named exports for YOUR components: \`export function Hero() { ... }\`
    **RULE**: Use named imports for YOUR components: \`import { Hero } from "@/components/landing/hero"\`

    --------------------------------------------------------------------------------
    **RETURN FORMAT**: JSON object with a "files" array.
    4.  **DARK MODE**: Force Dark Mode by default unless "Swiss" persona.
  `;

  // EXECUTION
  try {
    let prompt = "Portfolio";
    let plan = { sql: "", description: "Standard" };
    let currentFiles: any[] = [];
    
    try {
        const body = await req.json();
        // --- 1. VALIDATION (Fail-Fast) ---
        if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.length < 2) {
             return NextResponse.json({ error: "Invalid prompt. Please provide a description." }, { status: 400 });
        }
        
        prompt = body.prompt;
        plan = body.plan || plan;
        currentFiles = body.currentFiles || [];
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    let fileContext = "";
    if (currentFiles.length > 0) {
        // Filter out large/irrelevant files to save context
        const relevantFiles = currentFiles.filter((f: any) => 
            !f.path.includes("package-lock.json") && 
            !f.path.endsWith(".png") &&
            !f.path.endsWith(".ico")
        );
        
        fileContext = `
        --------------------------------------------------------------------------------
        ### CURRENT PROJECT STATE (CONTEXT)
        Here are the files currently in the project. 
        If the user is asking for an update, modify these files.
        If the user is asking for a new feature, add to this structure.
        
        ${relevantFiles.map((f: any) => `
        --- ${f.path} ---
        ${f.content}
        `).join("\n")}
        --------------------------------------------------------------------------------
        `;
    }

    const userMessage = `
    Prompt: ${prompt}
    Plan SQL: ${plan.sql}
    Plan Description: ${plan.description}
    ${fileContext}
    `;

    // 2. CHECK API KEY
    if (!process.env.OPENAI_API_KEY) {
         return NextResponse.json(
            { error: "OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env.local file." },
            { status: 500 }
         );
    }

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
            const completion = await openai.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage + (attempts > 1 ? "\n\nIMPORTANT: The previous attempt failed to generate valid JSON. Please ensure the response is strictly valid JSON with no trailing commas or missing brackets." : "") }
              ],
              model: "gpt-4o",
              response_format: { type: "json_object" },
              temperature: attempts > 1 ? 0.7 : 0.8, // Lower temp on retry for stability
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
                    // Try to repair the JSON
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
                 // Try to find "files" in a nested object if AI messed up
                 if (result.project && result.project.files) result.files = result.project.files;
                 else throw new Error("Missing 'files' array in response");
            }

            result.files = result.files.map((file: any) => {
                if (!file || !file.path) return file;

                // Fix path typo (Missing slash after alias)
                if (file.content) {
                    file.content = file.content.replace(/from ['"]@components\//g, 'from "@/components/');
                    file.content = file.content.replace(/from ['"]@lib\//g, 'from "@/lib/');
                }

                // Remove leading slashes
                if (file.path.startsWith('/')) file.path = file.path.substring(1);

                // Fix root page.tsx -> src/app/page.tsx
                if (file.path === 'page.tsx') file.path = 'src/app/page.tsx';
                
                // Fix app/ -> src/app/
                if (file.path.startsWith("app/")) file.path = "src/" + file.path;
                if (file.path.startsWith("components/")) file.path = "src/" + file.path;
                if (file.path.startsWith("lib/")) file.path = "src/" + file.path;
                
                return file;
            });

            // Inject Config Files (Ensure Boilerplate is present)
            CONFIG_FILES.forEach(configFile => {
                const existingIndex = result.files.findIndex((f: any) => f.path === configFile.path);
                if (existingIndex !== -1) {
                    result.files[existingIndex] = configFile;
                } else {
                    result.files.unshift(configFile);
                }
            });

            // Inject Mandatory UI Components (If missing)
            MANDATORY_UI_COMPONENTS.forEach(uiComponent => {
                const exists = result.files.some((f: any) => f.path === uiComponent.path);
                if (!exists) {
                    result.files.push(uiComponent);
                }
            });

            console.log("[CODEGEN] Success. Files:", result.files.length);
            return NextResponse.json({ files: result.files });

        } catch (innerError: any) {
            clearTimeout(timeoutId);
            console.error(`[CODEGEN] Attempt ${attempts} failed:`, innerError);
            lastError = innerError;
            // Continue to next attempt
        }
    }

    // If all attempts fail
    return NextResponse.json(
        { error: "Generation failed after multiple attempts. The AI Architect is currently overloaded. Please try again." }, 
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
