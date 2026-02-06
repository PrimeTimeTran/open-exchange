import React from 'react';
import { Button } from '@/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Zap,
  Briefcase,
  DollarSign,
  Monitor,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Mock data for demonstration purposes
const getJobBySlug = (slug: string) => {
  // In a real app, fetch from API or CMS
  return {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$160k - $220k + Equity',
    postedAt: '2 days ago',
    description: `We are looking for a Senior Frontend Engineer to lead the development of our core trading interface. You will be responsible for building high-performance, real-time React applications that handle thousands of updates per second.`,
    responsibilities: [
      'Architect and build scalable frontend applications using Next.js, React, and TypeScript.',
      'Optimize application performance for high-frequency data updates (WebSocket streams).',
      'Collaborate with product designers to implement pixel-perfect, responsive UIs.',
      'Lead code reviews and mentor junior engineers.',
      'Contribute to our internal component library and design system.',
    ],
    requirements: [
      '5+ years of experience with modern frontend frameworks (React, Vue, etc.).',
      'Deep understanding of TypeScript, React internals, and performance optimization.',
      'Experience with state management libraries (Zustand, Redux, etc.) and real-time data.',
      'Strong knowledge of CSS, Tailwind, and responsive design principles.',
      'Experience building financial or data-heavy applications is a plus.',
    ],
    benefits: [
      'Competitive salary and significant equity package.',
      '100% remote-first culture with flexible hours.',
      'Comprehensive health, dental, and vision insurance.',
      'Unlimited PTO and a generous equipment stipend.',
      'Annual company retreats and regular team meetups.',
    ],
  };
};

export default function JobPage({ params }: { params: { slug: string } }) {
  const job = getJobBySlug(params.slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation / Back Button */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/careers"
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
                  {job.department}
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
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Posted {job.postedAt}</span>
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
                <p>{job.description}</p>
                <p>
                  At our core, we value transparency, performance, and
                  user-centric design. In this role, you'll have the autonomy to
                  make architectural decisions and the support to execute them.
                  You'll work closely with a team of passionate builders who are
                  reshaping the future of digital asset exchange.
                </p>
              </div>
            </section>

            {/* Responsibilities */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-display">
                What You'll Do
              </h2>
              <ul className="space-y-4">
                {job.responsibilities.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="mt-1.5 min-w-5">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-display">
                What We Look For
              </h2>
              <ul className="space-y-4">
                {job.requirements.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="mt-1.5 min-w-5">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-display">
                Benefits & Perks
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {job.benefits.map((item, index) => (
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
