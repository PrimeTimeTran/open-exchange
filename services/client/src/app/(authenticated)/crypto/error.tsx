'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-6xl min-h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Prices Unavailable</h2>
      <p className="text-muted-foreground max-w-125">
        We encountered an issue loading your investment data. This could be due
        to a temporary connection issue with our market data providers.
      </p>
      <div className="flex gap-4 pt-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}
