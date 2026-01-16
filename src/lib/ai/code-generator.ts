import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';
import { AI_CONFIG, PROMPT_TEMPLATES, getValidModelId, VALID_MODELS } from './config';
import { ValidationEngine, GeneratedFile } from './validator';
import { PromptBuilder } from './prompt-builder';
import { COMPONENT_LIBRARY_PROMPT } from './library-context';
import { GlobalErrorEliminator } from '../error/global-eliminator';
import { FallbackSystem } from './fallback-system';

export type ProjectType = 'landing' | 'dashboard' | 'saas' | 'ecommerce' | 'portfolio';

export interface CodeGenerationOptions {
  framework?: 'react' | 'next' | 'vue' | 'svelte';
  styling?: 'tailwind' | 'css' | 'styled-components';
  features?: string[];
}

interface TechStack {
  framework: string;
  styling: string;
  database?: string;
  auth?: string;
  [key: string]: string | undefined;
}

interface ProjectIntent {
  projectType: ProjectType;
  features: string[];
  designStyle: 'modern' | 'minimal' | 'bold' | 'corporate' | 'creative';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  techStack: TechStack;
  businessLogic: string[];
}

interface FileStructure {
  [key: string]: string | FileStructure;
}

interface ProjectArchitecture {
  fileStructure: FileStructure;
  dependencies: Record<string, string>;
  components: string[];
}

export class SuperiorCodeGenerator {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private validator: ValidationEngine;
  private provider: 'anthropic' | 'openai' | 'openrouter';

  constructor(apiKey?: string) {
    this.provider = AI_CONFIG.provider as 'anthropic' | 'openai' | 'openrouter';
    
    // Check if any API key is present
    const hasOpenAI = !!(apiKey || process.env.OPENAI_API_KEY);
    const hasAnthropic = !!(apiKey || process.env.ANTHROPIC_API_KEY);
    const hasOpenRouter = !!(apiKey || process.env.OPENROUTER_API_KEY);

    if (!hasOpenAI && !hasAnthropic && !hasOpenRouter) {
      console.warn("⚠️ No API keys found. Switching to MOCK MODE.");
      this.provider = 'mock' as any;
      // We don't return here to allow validator initialization
    } else {
        if (this.provider === 'openai') {
          this.openai = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY,
          });
        } else if (this.provider === 'anthropic') {
          this.anthropic = new Anthropic({
            apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
          });
        }
    }
    // OpenRouter uses fetch, no SDK initialization needed
    
    this.validator = new ValidationEngine(apiKey);
  }

  private classifyTask(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // 1. Simple Tasks (CSS, Text, Color, Minor UI)
    if (
        lowerPrompt.includes('change color') || 
        lowerPrompt.includes('update text') || 
        lowerPrompt.includes('fix css') ||
        lowerPrompt.includes('style') ||
        lowerPrompt.includes('typo') ||
        lowerPrompt.includes('button') ||
        lowerPrompt.includes('margin') ||
        lowerPrompt.includes('padding') ||
        lowerPrompt.includes('font') ||
        (lowerPrompt.length < 100 && !lowerPrompt.includes('create') && !lowerPrompt.includes('build') && !lowerPrompt.includes('generate'))
    ) {
        return AI_CONFIG.models.fast; // claude-3-haiku
    }

    // 3. Complex Tasks (Architecture, Bug Fixes, Enterprise, Full Apps)
    if (
        lowerPrompt.includes('architecture') ||
        lowerPrompt.includes('refactor') ||
        lowerPrompt.includes('security') ||
        lowerPrompt.includes('complex') ||
        lowerPrompt.includes('full stack') ||
        lowerPrompt.includes('database') ||
        lowerPrompt.includes('optimization') ||
        lowerPrompt.includes('authentication') ||
        lowerPrompt.includes('payment') ||
        lowerPrompt.includes('dashboard') ||
        lowerPrompt.includes('admin') ||
        lowerPrompt.includes('saas') ||
        prompt.length > 500
    ) {
        return AI_CONFIG.models.advanced; // claude-3-opus
    }

    // 2. Standard Tasks (Components, Layouts) - Default
    return AI_CONFIG.models.standard; // claude-3.5-sonnet
  }

  private async callOpenRouter(systemPrompt: string, userPrompt: string, model: string, maxTokens: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout (3 mins)

    // Ensure we use a valid model ID
    let currentModel = getValidModelId(model);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_CONFIG.openRouter.apiKey}`,
                "HTTP-Referer": AI_CONFIG.openRouter.siteUrl,
                "X-Title": AI_CONFIG.openRouter.siteName,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": currentModel,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                "max_tokens": maxTokens,
                "temperature": AI_CONFIG.temperature,
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            
            // EMERGENCY FALLBACK: If model is invalid, switch to fallback and retry immediately
            if (response.status === 400 && (errorText.includes('not a valid model') || errorText.includes('model_not_found'))) {
                 console.warn(`[ROUTER] Model ${currentModel} invalid, switching to fallback...`);
                 return this.callOpenRouter(systemPrompt, userPrompt, VALID_MODELS.fallback, maxTokens);
            }

            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        
        // Basic JSON cleanup
        return content.replace(/```json\n?|\n?```/g, '').trim();
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`OpenRouter Call Failed for model ${currentModel}:`, error);
        
        // Intelligent Fallback Logic
        if (currentModel !== VALID_MODELS.fallback) {
            // Check for specific error types that warrant a fallback
            const errorMessage = error.message?.toLowerCase() || '';
            
            // Retry if: rate limited, server error, specific provider issues, OR TIMEOUT, OR INVALID MODEL
            if (errorMessage.includes('429') || errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('timeout') || errorMessage.includes('abort') || errorMessage.includes('network') || errorMessage.includes('not a valid model')) {
                 console.log(`[ROUTER] Primary model ${currentModel} failed (${errorMessage}). Switching to fallback ${VALID_MODELS.fallback}...`);
                 return this.callOpenRouter(systemPrompt, userPrompt, VALID_MODELS.fallback, maxTokens);
            }
        }
        
        // Propagate error up instead of swallowing it
        throw error;
    }
  }

  private async callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 4096, model?: string): Promise<string> {
    if (this.provider === 'mock' as any) {
        return this.generateMockResponse(userPrompt);
    }

    // Determine model if not provided or if using OpenRouter
    const targetModel = model || AI_CONFIG.model;

    if (this.provider === 'openrouter') {
        return this.callOpenRouter(systemPrompt, userPrompt, targetModel, maxTokens);
    }

    if (this.provider === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: targetModel.includes('gpt') ? targetModel : 'gpt-4o', // Fallback mapping
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: AI_CONFIG.temperature,
      });
      return response.choices[0]?.message?.content || '{}';
    } else if (this.anthropic) {
      const msg = await this.anthropic.messages.create({
        model: targetModel.includes('claude') ? targetModel : 'claude-3-5-sonnet-20241022', // Fallback mapping
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });
      return msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    }
    return '{}';
  }

  async generate(prompt: string, options?: CodeGenerationOptions, onStatus?: (status: string) => void): Promise<{ files: GeneratedFile[], dependencies: Record<string, string> }> {
    try {
      // === TRY 1: AI GENERATION ===
      onStatus?.('Analyzing intent...');
      const intent = await this.parseIntent(prompt);
      
      onStatus?.('Designing architecture...');
      const architecture = await this.generateArchitecture(intent, prompt);
      
      onStatus?.('Generating code...');
      const rawFiles = await this.generateCodeWithRouting(intent, architecture, prompt, options, onStatus);
      
      onStatus?.('Validating code...');
      const validationResult = await this.validator.validateBeforeGeneration(rawFiles);
      
      // If validation passed or was auto-fixed, return AI code
      if (validationResult.valid) {
        return {
          files: validationResult.files,
          dependencies: architecture.dependencies
        };
      }
      
      throw new Error("Validation failed even after auto-fix");

    } catch (error) {
      console.error("[Generator] AI Generation Failed:", error);
      onStatus?.('AI failed. Engaging fallback system...');

      // === TRY 3: STATIC FALLBACK (Safe) ===
      // Note: We skipped Try 2 (Retry) for brevity in this MVS, but it would go here.
      
      try {
        const intentType = prompt.toLowerCase().includes('dashboard') ? 'dashboard' : 'landing';
        const fallbackFiles = FallbackSystem.getStaticFallback(intentType);
        
        return {
          files: fallbackFiles,
          dependencies: { 
            "lucide-react": "latest",
            "clsx": "latest", 
            "tailwind-merge": "latest"
          }
        };
      } catch (fallbackError) {
        // === TRY 4: ULTIMATE FALLBACK (Unbreakable) ===
        console.error("[Generator] Static Fallback Failed:", fallbackError);
        return {
          files: [{
            path: "src/app/page.tsx",
            language: "typescript",
            content: "export default function Page() { return <div>System Error. Please try again.</div> }"
          }],
          dependencies: {}
        };
      }
    }
  }

  async parseIntent(prompt: string): Promise<ProjectIntent> {
    const text = await this.callAI(
      "You are an expert system architect. Analyze the user request and extract technical intent.",
      `Analyze this request: "${prompt}". Return JSON with: projectType, features[], designStyle, complexity, techStack, businessLogic.`
    );

    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonrepair(cleanText));
    } catch {
      // Fallback intent
      return {
        projectType: 'landing',
        features: [],
        designStyle: 'modern',
        complexity: 'simple',
        techStack: { framework: 'next', styling: 'tailwind' },
        businessLogic: []
      };
    }
  }

  async generateArchitecture(intent: ProjectIntent, originalPrompt: string): Promise<ProjectArchitecture> {
    const context = PROMPT_TEMPLATES[intent.projectType] || PROMPT_TEMPLATES.landing;
    
    const text = await this.callAI(
      AI_CONFIG.systemPrompt,
      `
          Plan the architecture for a ${intent.complexity} ${intent.projectType} project.
          Context: ${context}
          User Request: ${originalPrompt}
          
          ${COMPONENT_LIBRARY_PROMPT}

          Return JSON with:
          - fileStructure (tree)
          - dependencies (package.json format)
          - components (list of component names)
          
          Ensure specific versions for Next.js 14, React 18, TailwindCSS.
      `,
      2048
    );

    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonrepair(cleanText));
    } catch {
       return {
         fileStructure: {},
         dependencies: {},
         components: []
       };
    }
  }

  async generateCodeWithRouting(intent: ProjectIntent, architecture: ProjectArchitecture, prompt: string, options?: CodeGenerationOptions, onStatus?: (status: string) => void): Promise<GeneratedFile[]> {
    // 1. Route the task
    const selectedModel = this.provider === 'openrouter' ? this.classifyTask(prompt) : undefined;
    
    if (selectedModel) {
        onStatus?.(`Routing to model: ${selectedModel}`);
    }
    console.log(`[ROUTER] Routing task to model: ${selectedModel || this.provider}`);

    // 2. Build Context
    onStatus?.('Generating code...');
    
    // STRATEGY 7: GENERATE LESS, COMPOSE MORE
    // We inject the COMPONENT_LIBRARY_PROMPT to force the AI to use our verified patterns
    // This reduces hallucinations and ensures consistent UI quality.
    
    // === SOUL INJECTION ===
    // We use PromptBuilder to inject Personality, Psychology, and Magic Questions
    const systemPrompt = PromptBuilder.buildSystemPrompt(prompt);

    const text = await this.callAI(
      systemPrompt,
      `
          Generate the COMPLETE source code for this project.
          Intent: ${JSON.stringify(intent)}
          Architecture: ${JSON.stringify(architecture)}
          User Request: ${prompt}
          Options: ${JSON.stringify(options)}
          
          ${COMPONENT_LIBRARY_PROMPT}
          
          CRITICAL:
          - Generate ALL necessary files (pages, components, lib, styles).
          - Return a JSON object with a "files" array: { path, content, language }.
          - NO PLACEHOLDERS.
          - Use correct template literals.
      `,
      AI_CONFIG.maxTokens,
      selectedModel
    );
    
    try {
      // Clean up markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const result = JSON.parse(jsonrepair(cleanText));
      
      // CRITICAL CHECK: Ensure we actually have files
      if (!result.files || !Array.isArray(result.files) || result.files.length === 0) {
          throw new Error("AI returned no files in response.");
      }

      // === PHASE 2 UPGRADE: GLOBAL ERROR ELIMINATION ===
      onStatus?.('Running Global Error Eliminator...');
      const { fixedFiles } = await GlobalErrorEliminator.eliminateAll(result.files);

      return fixedFiles;
    } catch (e: any) {
      console.error("JSON parse error in generateCode", e);
      console.error("Raw text from AI:", text); 
      throw new Error(`Failed to parse generated code: ${e.message}`); 
    }
  }

  // Legacy method for backward compatibility
  async generateCode(intent: ProjectIntent, architecture: ProjectArchitecture, prompt: string, options?: CodeGenerationOptions): Promise<GeneratedFile[]> {
      return this.generateCodeWithRouting(intent, architecture, prompt, options);
  }

  // --- MOCK MODE FIX ---
  // If keys are missing, we MUST ensure this returns a full working project
  async generateMockResponse(prompt: string): Promise<string> {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      
      console.log("[MOCK] Generating high-fidelity mock response for:", prompt);

      const isLogin = prompt.toLowerCase().includes('login') || prompt.toLowerCase().includes('sign in');
      const isDashboard = prompt.toLowerCase().includes('dashboard');
      const isLanding = !isLogin && !isDashboard;

      // 1. DASHBOARD MOCK
      if (isDashboard) {
        return JSON.stringify({
          files: [
             {
               path: "src/app/page.tsx",
               language: "typescript",
               content: `
import React from 'react';
import { LayoutDashboard, Users, ShoppingCart, TrendingUp, Bell, Search, Menu } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg mr-3" />
          <span className="font-bold text-lg tracking-tight">Nexus</span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard />} label="Overview" active />
          <NavItem icon={<Users />} label="Customers" />
          <NavItem icon={<ShoppingCart />} label="Orders" />
          <NavItem icon={<TrendingUp />} label="Analytics" />
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 rounded-xl p-4">
            <h4 className="font-bold text-sm mb-1">Pro Plan</h4>
            <p className="text-xs text-gray-400 mb-3">Your team is growing fast!</p>
            <button className="w-full bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors">Upgrade</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center text-gray-400">
            <Search className="w-5 h-5 mr-3" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-sm w-64" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full ring-2 ring-white/10" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">Export</button>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">New Report</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Revenue" value="$45,231.89" change="+20.1%" trend="up" />
            <StatCard title="Active Users" value="+2350" change="+180.1%" trend="up" />
            <StatCard title="Sales" value="+12,234" change="+19%" trend="up" />
            <StatCard title="Active Now" value="+573" change="+201" trend="up" />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-xl p-6 h-[400px]">
              <h3 className="font-bold mb-4">Revenue Over Time</h3>
              <div className="w-full h-full flex items-end gap-2 pb-8">
                 {[40, 60, 45, 70, 80, 50, 90, 75, 85, 60, 70, 95].map((h, i) => (
                   <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors rounded-t-sm relative group" style={{ height: \`\${h}%\` }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">\${h}k</div>
                   </div>
                 ))}
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold mb-4">Recent Sales</h3>
              <div className="space-y-4">
                <SaleItem name="Olivia Martin" email="olivia.martin@email.com" amount="+$1,999.00" />
                <SaleItem name="Jackson Lee" email="jackson.lee@email.com" amount="+$39.00" />
                <SaleItem name="Isabella Nguyen" email="isabella.nguyen@email.com" amount="+$299.00" />
                <SaleItem name="William Kim" email="will@email.com" amount="+$99.00" />
                <SaleItem name="Sofia Davis" email="sofia.davis@email.com" amount="+$39.00" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors \${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}\`}>
      {React.cloneElement(icon, { size: 18 })}
      {label}
    </button>
  );
}

function StatCard({ title, value, change, trend }: any) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-xs text-gray-400 mt-1">
        <span className="text-green-400">{change}</span> from last month
      </p>
    </div>
  );
}

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium leading-none text-white">{name}</p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
      </div>
      <div className="font-medium text-white">{amount}</div>
    </div>
  );
}
               `
             }
          ]
        });
      }

      // 2. LANDING PAGE MOCK
      if (isLanding) {
        return JSON.stringify({
           files: [
             {
               path: "src/app/page.tsx",
               language: "typescript",
               content: `
import React from 'react';
import { ArrowRight, Check, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">Acme<span className="text-cyan-500">.ai</span></div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Build software at the <br/> speed of thought.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The world's most advanced AI-powered development platform. Write code, debug issues, and deploy in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
               Start Building <ArrowRight className="w-5 h-5" />
             </button>
             <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
               View Documentation
             </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-black/50 border-t border-white/5">
        <div className="container mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="text-yellow-400" />} 
                title="Lightning Fast" 
                desc="Deploy your applications in milliseconds with our edge network." 
              />
              <FeatureCard 
                icon={<Shield className="text-green-400" />} 
                title="Enterprise Security" 
                desc="Bank-grade encryption and SOC2 compliance out of the box." 
              />
              <FeatureCard 
                icon={<Globe className="text-blue-400" />} 
                title="Global Scale" 
                desc="Automatically scale your infrastructure to meet demand anywhere." 
              />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2024 Acme AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors group">
      <div className="mb-4 p-3 bg-black rounded-lg w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
               `
             }
           ]
        });
      }

      // Default to Login Mock (fallback)
      return JSON.stringify({
          files: [
              {
                  path: "src/app/page.tsx",
                  content: `
import React from 'react';
import { Mail, Lock, ArrowRight, Github, Twitter } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Enter your credentials to access the system</p>
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="email" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="button"
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
                  `,
                  language: "typescript"
              }
          ]
      });
  }
}
