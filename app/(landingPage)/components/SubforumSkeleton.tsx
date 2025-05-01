'use client';
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SubforumSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="px-5 py-4 bg-gray-100">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-2 mt-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
