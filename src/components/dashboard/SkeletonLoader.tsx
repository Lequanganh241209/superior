import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 p-4 gap-4">
      {/* Header Skeleton */}
      <div className="h-12 w-full flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 bg-zinc-800" />
          <Skeleton className="h-8 w-24 bg-zinc-800" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-8 w-24 bg-zinc-800" />
            <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Editor Skeleton */}
        <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-full w-full rounded-xl bg-zinc-900/50" />
        </div>
        
        {/* Preview Skeleton */}
        <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-full w-full rounded-xl bg-zinc-900/50" />
        </div>
      </div>
    </div>
  );
}
