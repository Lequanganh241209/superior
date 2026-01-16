
import { NextRequest, NextResponse } from 'next/server';
import { SuperiorCodeGenerator } from '@/lib/ai/code-generator';
import { ValidationEngine } from '@/lib/ai/validator';
import { z } from 'zod';

export const maxDuration = 300; // 5 minutes (Vercel Hobby Limit is 10s, Pro is 300s. We set 300s to match Pro)
// Note: If self-hosting, this can be increased further. 
// Ideally we want 360s (6 mins) but Vercel limits might cap at 300s for Serverless Functions.
// For longer tasks, we should use Edge Functions or Background Jobs, but for now 300s is a good upgrade from default.

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  options: z.object({
    framework: z.enum(['react', 'next', 'vue', 'svelte']).optional(),
    styling: z.enum(['tailwind', 'css', 'styled-components']).optional(),
    features: z.array(z.string()).optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const validation = requestSchema.safeParse(json);

  if (!validation.success) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Invalid request', 
      errors: validation.error.flatten() 
    }, { status: 400 });
  }

  const { prompt, options } = validation.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try {
            controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        } catch (e) {
            // Controller might be closed if client disconnected
            console.error("Failed to enqueue data:", e);
        }
      };

      try {
        const generator = new SuperiorCodeGenerator();
        const validator = new ValidationEngine();

        // 1. INTENT ANALYSIS
        send({ status: 'planning', progress: 5, message: '🧠 Analyzing your requirements...' });
        const intent = await generator.parseIntent(prompt);
        send({ status: 'planning', progress: 10, message: `🎯 Detected intent: ${intent.projectType} (${intent.complexity})` });
        
        // 2. ARCHITECTURE DESIGN
        send({ status: 'planning', progress: 15, message: '🏗️ Designing system architecture...' });
        const architecture = await generator.generateArchitecture(intent, prompt);
        send({ status: 'planning', progress: 25, message: `📋 Blueprint ready: ${architecture.components.length} components planned.` });

        // 3. CODE GENERATION (The Long Part)
        send({ status: 'generating', progress: 30, message: '🚀 Starting code generation engine...', dependencies: architecture.dependencies });
        
        const rawFiles = await generator.generateCodeWithRouting(
            intent, 
            architecture, 
            prompt, 
            options,
            (status) => {
                // Relay detailed status from the generator
                // We map generator progress roughly to 30-80% range
                send({ status: 'generating', progress: undefined, message: status });
            }
        );
        
        // 4. VALIDATION & HEALING
        send({ status: 'validating', progress: 85, message: '🛡️ Validating code integrity...' });
        const validationResult = await validator.validateBeforeGeneration(rawFiles);
        
        if (!validationResult.valid) {
             send({ status: 'validating', progress: 90, message: '🔧 Auto-healing detected issues...' });
        } else {
             send({ status: 'validating', progress: 95, message: '✅ Code passed all checks.' });
        }

        // 5. FINALIZATION
        send({ 
          status: 'complete', 
          progress: 100, 
          message: '✨ System Online. Ready for preview.',
          files: validationResult.files,
          dependencies: architecture.dependencies,
          errors: validationResult.errors 
        });

        controller.close();
      } catch (error: any) {
        console.error('Generation failed:', error);
        send({
          status: 'error',
          message: error.message || 'An unexpected error occurred',
          progress: 0
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}
