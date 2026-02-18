import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="flex flex-col gap-8">
        {/* Card 1 Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-7 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-75 flex items-center gap-8">
            <Skeleton className="h-50 w-50 rounded-full shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-7 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-75 flex items-center gap-8">
            <Skeleton className="h-50 w-50 rounded-full shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
