"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 pb-40 pt-6 space-y-8 min-h-screen">
      <header className="flex items-center justify-between py-2">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </header>
      <div className="h-px w-full bg-border/40 mb-4" />
      
      <section className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </section>

      <section className="space-y-4">
        <Skeleton className="h-24 w-full rounded-[2rem]" />
      </section>

      <section className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function LogsSkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 pb-40 pt-6 space-y-10 min-h-screen">
      <header className="flex items-center justify-between py-2 border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-4">
           <Skeleton className="h-10 w-32 rounded-lg" />
           <Skeleton className="h-10 w-12 rounded-lg" />
        </div>
      </header>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
