
'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorRecoveryProps {
  error: string;
  onRetry: () => void;
}

export function ErrorRecovery({ error, onRetry }: ErrorRecoveryProps) {
  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          Generation Paused
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          We encountered an issue while generating your application. Our self-healing systems attempted to fix it but required a manual retry.
        </p>
        <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-sm font-mono text-red-400 break-words">
          {error}
        </div>
        <Button onClick={onRetry} variant="destructive" className="w-full gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retry Generation
        </Button>
      </CardContent>
    </Card>
  );
}
