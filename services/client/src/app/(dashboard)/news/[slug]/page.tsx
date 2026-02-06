'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewsArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/home"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="font-bold">CoinDesk</span>
            <span>•</span>
            <span>2h ago</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Bitcoin Surges Past $43k as Institutional Adoption Grows ({slug})
          </h1>

          <div className="w-full h-64 bg-muted rounded-xl mb-8 flex items-center justify-center text-muted-foreground">
            Feature Image Placeholder
          </div>

          <p className="lead text-xl text-muted-foreground mb-6">
            Cryptocurrency markets are seeing a significant uptick today as
            major financial institutions announce new digital asset initiatives.
          </p>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>

          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Market Impact</h2>

          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>

          <blockquote className="border-l-4 border-primary pl-4 italic my-6">
            "This is a watershed moment for the industry," says Jane Doe, Chief
            Strategy Officer at Future Finance.
          </blockquote>

          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>
        </article>
      </div>
    </div>
  );
}
