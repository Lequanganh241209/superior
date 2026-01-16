'use client';

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview,
  SandpackFileExplorer
} from '@codesandbox/sandpack-react';
import { GeneratedFile } from './code-generator';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectPreviewProps {
  files: GeneratedFile[];
  dependencies: Record<string, string>;
}

import { VISION_SCRIPT } from '@/lib/preview/vision-script';

export function ProjectPreview({ files, dependencies }: ProjectPreviewProps) {
  // Transform files to Sandpack format
  const sandpackFiles = files.reduce((acc, file) => {
    // Clean path logic
    let path = file.path;
    if (!path.startsWith('/')) path = '/' + path;
    
    // Sandpack Next.js template prefers /app or /pages at root, but handles src/app too.
    // We just map directly.
    
    // INJECT VISION SCRIPT INTO ROOT LAYOUT
    let content = file.content;
    if (path.includes('layout.tsx') || path.includes('layout.js')) {
        // Simple injection before </body> or inside return if possible
        // Ideally we put it in useEffect, but raw script tag works in Next.js too with warning
        // Better: Inject a component call
        if (content.includes('</body>')) {
            content = content.replace('</body>', `
              <script dangerouslySetInnerHTML={{ __html: \`${VISION_SCRIPT}\` }} />
            </body>`);
        } else if (content.includes('return (')) {
             // Fallback for non-html layouts
             // Try to inject before last closing tag
             const lastDiv = content.lastIndexOf('</div>');
             if (lastDiv > 0) {
                 // Risky but works for demo
                 content = content.slice(0, lastDiv + 6) + 
                 `\n<script dangerouslySetInnerHTML={{ __html: \`${VISION_SCRIPT}\` }} />` + 
                 content.slice(lastDiv + 6);
             }
        }
    }

    acc[path] = {
      code: content,
      active: path.includes('page.tsx') || path.includes('page.js')
    };
    return acc;
  }, {} as Record<string, any>);

  if (Object.keys(sandpackFiles).length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <p>No files generated yet.</p>
          </div>
      );
  }

  // Common dependencies that the AI often uses
  const DEFAULT_DEPENDENCIES = {
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "tailwindcss-animate": "latest",
    "framer-motion": "latest",
    "recharts": "latest",
    "date-fns": "latest",
    "react-day-picker": "latest",
    "class-variance-authority": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-tooltip": "latest",
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest"
  };

  return (
    <Card className="border-none shadow-2xl bg-card h-full flex flex-col">
      <CardContent className="p-0 overflow-hidden rounded-xl h-full flex-1">
        <SandpackProvider
          template="nextjs"
          theme="dark"
          files={sandpackFiles}
          customSetup={{
            dependencies: {
              ...DEFAULT_DEPENDENCIES,
              ...dependencies,
            }
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            classes: {
              "sp-layout": "h-full",
              "sp-wrapper": "h-full",
              "sp-preview-iframe": "h-full",
            }
          }}
        >
          <SandpackLayout className="h-full">
            {/* Hide FileExplorer by default to focus on Preview, can be toggled via our own tabs */}
            <SandpackPreview 
                showNavigator={true} 
                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                style={{ height: '100%' }} 
            />
          </SandpackLayout>
        </SandpackProvider>
      </CardContent>
    </Card>
  );
}
