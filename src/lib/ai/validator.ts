
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_CONFIG } from './config';
import { GENERATION_CONSTRAINTS } from './constraints';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface ValidationError {
  type: 'SYNTAX_ERROR' | 'TYPE_ERROR' | 'MISSING_IMPORT' | 'CIRCULAR_DEPENDENCY' | 'PLACEHOLDER_FOUND' | 'TEMPLATE_LITERAL_ERROR' | 'BANNED_PATTERN';
  message: string;
  file: string;
  line?: number;
}

export interface ValidationResult {
  valid: boolean;
  files: GeneratedFile[];
  errors: ValidationError[];
}

export class ValidationEngine {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private provider: 'anthropic' | 'openai';

  constructor(apiKey?: string) {
    this.provider = AI_CONFIG.provider as 'anthropic' | 'openai';
    
    if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
    } else {
      this.anthropic = new Anthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async validateBeforeGeneration(files: GeneratedFile[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const file of files) {
      // 1. Check for Placeholders
      if (file.content.includes('// TODO') || file.content.includes('// Implement this')) {
        errors.push({
          type: 'PLACEHOLDER_FOUND',
          message: 'Code contains placeholders',
          file: file.path
        });
      }

      // 2. Check for Banned Patterns (Security & Quality)
      for (const ban of GENERATION_CONSTRAINTS.bannedPatterns) {
          if (ban.pattern.test(file.content)) {
              errors.push({
                  type: 'BANNED_PATTERN',
                  message: `Violation: ${ban.reason}`,
                  file: file.path
              });
              // Auto-fix simple ones
              if (ban.reason.includes('console.log')) {
                  file.content = file.content.replace(/console\.log\(.*?\);?/g, '');
              }
          }
      }

      // 3. Check for Template Literal Errors
      // Looking for ``` inside TypeScript/JavaScript files which might be hallucinated markdown code blocks
      if ((file.language === 'typescript' || file.language === 'javascript' || file.language === 'tsx' || file.language === 'jsx') && 
          (file.content.includes('```') || file.content.match(/\\(\$)\{/))) {
        errors.push({
          type: 'TEMPLATE_LITERAL_ERROR',
          message: 'Malformed template literal or markdown block found',
          file: file.path
        });
      }
      
      // 4. Check for Missing Imports (Basic heuristic)
      if (file.language === 'tsx' || file.language === 'jsx') {
          // React check
          if (file.content.includes('useState') && !file.content.match(/import.*useState/)) {
             // Heuristic Fix: Inject import
             file.content = `import React, { useState } from 'react';\n${file.content}`;
          }
          if (file.content.includes('useEffect') && !file.content.match(/import.*useEffect/)) {
             if (!file.content.includes('import React')) {
                 file.content = `import React, { useEffect } from 'react';\n${file.content}`;
             }
          }
      }
    }
    
    // Check if package.json exists in the file list
    const hasPackageJson = files.some(f => f.path === 'package.json');
    if (!hasPackageJson) {
        // Inject default package.json
        files.push({
            path: 'package.json',
            language: 'json',
            content: JSON.stringify({
                name: "generated-project",
                version: "0.1.0",
                private: true,
                dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "lucide-react": "^0.300.0",
                    "clsx": "^2.1.0",
                    "tailwind-merge": "^2.2.0"
                }
            }, null, 2)
        });
    }

    if (errors.length > 0) {
      console.log(`[VALIDATOR] Found ${errors.length} errors. Attempting auto-fix...`);
      return this.autoFix(files, errors);
    }

    return { valid: true, files, errors: [] };
  }

  async autoFix(files: GeneratedFile[], errors: ValidationError[]): Promise<ValidationResult> {
    let fixedFiles = [...files];
    
    for (const error of errors) {
      const fileIndex = fixedFiles.findIndex(f => f.path === error.file);
      if (fileIndex === -1) continue;

      const file = fixedFiles[fileIndex];

      switch (error.type) {
        case 'TEMPLATE_LITERAL_ERROR':
          // Fix ``` to ` and \${ to ${
          fixedFiles[fileIndex] = {
            ...file,
            content: file.content
              .replace(/```/g, '`') // Replace markdown blocks with backticks if inside code
              .replace(/\\\$\{/g, '${') // Fix escaped interpolation
          };
          break;
        
        case 'BANNED_PATTERN':
           // Auto-fix simple banned patterns
           if (error.message.includes('console.log')) {
              fixedFiles[fileIndex] = {
                  ...file,
                  content: file.content.replace(/console\.log\(.*?\);?/g, '')
              };
           }
           if (error.message.includes('style={{')) {
              // Can't auto-fix styles reliably without context, so we might skip or flag
              // For MVS, we just remove it to prevent crashes
              fixedFiles[fileIndex] = {
                  ...file,
                  content: file.content.replace(/style=\{\{.*?\}\}/g, '')
              };
           }
           break;

        case 'PLACEHOLDER_FOUND':
        case 'SYNTAX_ERROR':
          // Use AI to fix complex errors
          fixedFiles[fileIndex] = await this.aiFix(file, error);
          break;
      }
    }

    return { valid: true, files: fixedFiles, errors: [] };
  }

  private async aiFix(file: GeneratedFile, error: ValidationError): Promise<GeneratedFile> {
    console.log(`[VALIDATOR] AI Fixing ${error.type} in ${file.path}...`);
    
    const systemPrompt = "You are an expert code validator. Fix the code errors.";
    const userPrompt = `
      Fix the following error in the file "${file.path}":
      Error: ${error.message}
      
      File Content:
      \`\`\`${file.language}
      ${file.content}
      \`\`\`
      
      Return ONLY the corrected full file content. Do not include markdown formatting or explanations.
    `;

    try {
      let content = '';
      
      if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4096,
        });
        content = response.choices[0]?.message?.content || '';
      } else if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: AI_CONFIG.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        });
        content = response.content[0].type === 'text' ? response.content[0].text : '';
      }

      const cleanContent = content.replace(/```[a-z]*\n?|\n?```/g, '').trim();

      return {
        ...file,
        content: cleanContent
      };
    } catch (e) {
      console.error('[VALIDATOR] AI Fix failed', e);
      return file; // Return original if fix fails
    }
  }
}
