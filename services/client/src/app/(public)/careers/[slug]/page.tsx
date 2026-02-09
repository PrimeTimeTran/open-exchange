import React from 'react';
import Link from 'next/link';
import { prisma } from '@/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import {
  Clock,
  Globe,
  Monitor,
  ArrowLeft,
  Briefcase,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const SimpleMarkdown = ({ content }: { content: string | null }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Handle headers
    if (line.startsWith('### ')) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc pl-5 space-y-2 mb-4">
            {currentList}
          </ul>,
        );
        currentList = [];
      }
      elements.push(
        <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-foreground">
          {line.replace('### ', '')}
        </h3>,
      );
      return;
    }

    // Handle lists
    if (line.trim().startsWith('- ')) {
      const text = line.trim().substring(2);
      const parts = text.split('**');
      const children = parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        ),
      );

      currentList.push(
        <li key={index} className="text-muted-foreground">
          {children}
        </li>,
      );
      return;
    }

    // Flush list if we hit a non-list line
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${index}`} className="list-disc pl-5 space-y-2 mb-4">
          {currentList}
        </ul>,
      );
      currentList = [];
    }

    // Handle paragraphs
    if (line.trim() !== '') {
      const parts = line.split('**');
      const children = parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        ),
      );
      elements.push(
        <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
          {children}
        </p>,
      );
    }
  });

  if (currentList.length > 0) {
    elements.push(
      <ul key="list-end" className="list-disc pl-5 space-y-2 mb-4">
        {currentList}
      </ul>,
    );
  }

  return <>{elements}</>;
};

export default async function JobPage({
  params,
}: {
  params: { slug: string };
}) {
  const decodedSlug = decodeURIComponent(params.slug);
  const slugTitle = decodedSlug.replace(/-/g, ' ');

  // Try to find job by ID first if it looks like a UUID (legacy support or direct links)
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      params.slug,
    );
  let job = null;

  if (isUuid) {
    job = await prisma.job.findUnique({
      where: { id: params.slug },
    });
  }

  // If not found by ID (or not a UUID), try to find by title (assuming slug is title-based)
  // This is a simple fuzzy match or exact match depending on how strict we want to be
  if (!job) {
    job = await prisma.job.findFirst({
      where: {
        title: {
          mode: 'insensitive',
          equals: slugTitle,
        },
      },
    });
  }

  if (!job) {
    notFound();
  }

  // Helper to parse potential markdown or list items if stored as string
  // Assuming description/requirements/responsibilities are markdown strings
  // We will render them as simple paragraphs or lists for now if no markdown renderer is available
  // But ideally use a markdown renderer component if available.
  // Since user asked not to use new packages, we will try to format it cleanly.

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'Competitive';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumSignificantDigits: 3,
    }).format(amount);
  };

  const salaryRange =
    job.salaryLow && job.salaryHigh
      ? `${formatCurrency(job.salaryLow, job.currency)} - ${formatCurrency(
          job.salaryHigh,
          job.currency,
        )}`
      : 'Competitive Salary';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation / Back Button */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/careers/search"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Careers
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
              Apply for this role
            </span>
            <Button size="sm" className="rounded-full">
              Apply Now
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-5xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="outline"
                  className="px-3 py-1 border-primary/20 bg-primary/5 text-primary"
                >
                  {job.team}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {job.type}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3" />
                  {job.location}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span>{salaryRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* About the Role */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-display">
                About the Role
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <SimpleMarkdown content={job.description} />
              </div>
            </section>

            {/* Responsibilities */}
            {job.responsibilities && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold font-display">
                  What You'll Do
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <SimpleMarkdown content={job.responsibilities} />
                </div>
              </section>
            )}

            {/* Requirements */}
            {job.requirements && (
              <section className="space-y-6">
                <h2 className="text-2xl font-bold font-display">
                  What We Look For
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <SimpleMarkdown content={job.requirements} />
                </div>
              </section>
            )}

            {/* Benefits - Hardcoded for now as it's not in DB schema explicitly as array */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-display">
                Benefits & Perks
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Competitive salary and equity package',
                  'Remote-first culture with flexible hours',
                  'Comprehensive health, dental, and vision insurance',
                  'Unlimited PTO and equipment stipend',
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 flex gap-3 items-start"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                <h3 className="text-xl font-bold">Apply for this Job</h3>
                <p className="text-sm text-muted-foreground">
                  Join us in building the transparent future of finance.
                </p>

                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="resume" className="text-sm font-medium">
                      Resume/CV
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                      <Briefcase className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground/60 mt-1">
                        PDF, DOCX up to 10MB
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="linkedin" className="text-sm font-medium">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      id="linkedin"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portfolio" className="text-sm font-medium">
                      Portfolio / Website
                    </label>
                    <input
                      type="text"
                      id="portfolio"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <Button className="w-full text-lg h-12" size="lg">
                    Submit Application
                  </Button>
                </form>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'React',
                    'Next.js',
                    'TypeScript',
                    'Tailwind',
                    'Rust',
                    'Go',
                    'PostgreSQL',
                    'Redis',
                  ].map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-background/50 hover:bg-background border-primary/10"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="py-16 px-6 border-t border-border/40 bg-muted/30 mt-12">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-display font-bold">
            Not the right fit?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're always looking for talented individuals. Check out our other
            open positions or join our talent network.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/careers">View All Openings</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
