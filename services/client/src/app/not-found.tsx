import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-9xl font-bold text-primary opacity-10 select-none">
        404
      </h1>
      <div className="absolute flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h2>
        <p className="text-muted-foreground max-w-125">
          Sorry, we couldn't find the page you're looking for. It might have
          been removed, renamed, or doesn't exist.
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
