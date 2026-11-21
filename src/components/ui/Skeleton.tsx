import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-cw-sunken animate-pulse rounded-xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="cw-card overflow-hidden flex flex-col justify-between">
      <div>
        <div className="h-28 w-full bg-cw-sunken animate-pulse rounded-t-2xl" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
          <div className="pt-2 flex items-center justify-between">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="p-3 px-4 cw-hairline flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-xl" />
      </div>
    </div>
  );
}
