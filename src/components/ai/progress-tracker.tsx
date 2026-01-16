
'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Code, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GenerationStatus } from './code-generator';

interface ProgressTrackerProps {
  status: GenerationStatus;
  progress: number;
  message: string;
}

const steps = [
  { id: 'planning', label: 'Planning', icon: Zap },
  { id: 'generating', label: 'Generating', icon: Code },
  { id: 'validating', label: 'Validating', icon: ShieldCheck },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

export function ProgressTracker({ status, progress, message }: ProgressTrackerProps) {
  const currentStepIndex = steps.findIndex(s => s.id === status);
  const isComplete = status === 'complete';

  return (
    <Card className="border-none bg-background/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => {
              const isActive = step.id === status;
              const isPast = steps.findIndex(s => s.id === status) > index || isComplete;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive || isPast ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isActive && status !== 'complete' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isActive || isPast ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
            
            {/* Progress Line Background */}
            <div className="absolute top-11 left-0 w-full h-1 bg-muted -z-0 hidden md:block" />
            
            {/* Active Progress Line */}
            {/* This is hard to do perfectly responsive without absolute positioning calculations, 
                so we'll skip the connecting line for now or implement a simple one */}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">{message}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
