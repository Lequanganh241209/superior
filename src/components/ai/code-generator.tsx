
'use client';

import { useState } from 'react';
import { ProgressTracker } from './progress-tracker';
import { ProjectPreview } from './project-preview';
import { ErrorRecovery } from './error-recovery';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useProjectStore } from '@/store/project-store';

export type GenerationStatus = 'idle' | 'planning' | 'generating' | 'validating' | 'complete' | 'error';

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export function CodeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [dependencies, setDependencies] = useState<Record<string, string>>({});

  const { createProject, updateProjectFiles, setGeneratedFiles } = useProjectStore();

  async function handleGenerate() {
    if (!prompt.trim()) return;
    
    setStatus('planning');
    setProgress(0);
    setFiles([]);
    
    // Create project in store immediately to track it
    const projectId = createProject("New AI Project", prompt);
    
    try {
      const response = await fetch('/api/ai/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const data = JSON.parse(line);
            
            if (data.status === 'error') {
              throw new Error(data.error);
            }

            setStatus(data.status);
            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);
            if (data.dependencies) setDependencies(data.dependencies);
            if (data.files) {
                setFiles(data.files);
                // Sync with store in real-time (optional, maybe just on complete)
                setGeneratedFiles(data.files);
                updateProjectFiles(projectId, data.files);
            }
            
          } catch (e) {
            console.error('Error parsing JSON chunk:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      setStatus('error');
      toast.error(error.message || 'Failed to generate code');
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Aether Architect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your dream application..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] text-lg resize-none"
            disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
          />
          <Button 
            size="lg" 
            className="w-full text-lg h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300"
            onClick={handleGenerate}
            disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
          >
            {status === 'idle' || status === 'complete' || status === 'error' ? 'Generate Application' : 'Building...'}
          </Button>
        </CardContent>
      </Card>

      {(status !== 'idle' && status !== 'error') && (
        <ProgressTracker 
          status={status} 
          progress={progress} 
          message={statusMessage} 
        />
      )}

      {status === 'error' && (
        <ErrorRecovery 
            error={statusMessage || "Unknown error occurred"} 
            onRetry={handleGenerate} 
        />
      )}

      {files.length > 0 && (
        <ProjectPreview files={files} dependencies={dependencies} />
      )}
    </div>
  );
}
