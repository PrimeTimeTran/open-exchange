import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import {
  Code,
  Globe,
  Lock,
  Zap,
  Users,
  Radio,
  Cpu,
  BookOpen,
  ArrowRight,
  Activity,
  Trophy,
  Star,
  Check,
} from 'lucide-react';

const benefits = [
  {
    title: 'Open Source First',
    description:
      'Work on code that is visible to the world. Contribute to the ecosystem.',
    icon: <Code className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Remote Native',
    description: 'Work from anywhere. We value output over hours.',
    icon: <Globe className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Competitive Equity',
    description: 'Own a piece of the protocol you are building.',
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Privacy & Security',
    description:
      'Work on cutting edge cryptography and security implementations.',
    icon: <Lock className="w-6 h-6 text-primary" />,
  },
];

const values = [
  {
    title: 'Radical Transparency',
    description:
      'We believe in building in public. Our roadmap, our code, and our decisions are open for scrutiny.',
    icon: <BookOpen className="w-8 h-8 mb-4 text-primary" />,
  },
  {
    title: 'Community Driven',
    description:
      'We are not just a company, we are a protocol. We listen to our community and build what they need.',
    icon: <Users className="w-8 h-8 mb-4 text-primary" />,
  },
  {
    title: 'Verifiable Trust',
    description:
      "Don't trust, verify. Our architecture is designed to be auditable by anyone, anywhere.",
    icon: <Radio className="w-8 h-8 mb-4 text-primary" />,
  },
  {
    title: 'Engineering Excellence',
    description:
      'We prioritize correctness, performance, and security over moving fast and breaking things.',
    icon: <Cpu className="w-8 h-8 mb-4 text-primary" />,
  },
];

const stats = [
  {
    label: 'Daily Volume',
    value: '$2B+',
    icon: Activity,
  },
  {
    label: 'Global Users',
    value: '500k+',
    icon: Users,
  },
  {
    label: 'Uptime',
    value: '99.99%',
    icon: Zap,
  },
  {
    label: 'Latency',
    value: '<5ms',
    icon: Trophy,
  },
];

const testimonials = [
  {
    q: 'The most technically challenging and rewarding work of my career. We are rewriting the rules of finance.',
    a: 'Sarah Chen',
    r: 'Principal Engineer',
  },
  {
    q: 'A culture that genuinely values open source and transparency. No black boxes here.',
    a: 'Mark Davis',
    r: 'Core Contributor',
  },
  {
    q: 'Remote-first done right. I feel more connected to this team than I did in an office.',
    a: 'Alex Morgan',
    r: 'Product Designer',
  },
];

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 1. Hero Section - Background: Default */}
      <section className="relative py-24 px-6 md:py-32 lg:px-8 border-b border-border/40 overflow-hidden bg-background">
        <div className="mx-auto max-w-4xl flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-medium text-primary bg-primary/5">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            We're Hiring
          </div>

          <h1 className="text-4xl md:text-7xl font-display font-bold tracking-tight text-foreground max-w-4xl">
            Build the Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Finance
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Join a team of builders, dreamers, and skeptics. We're building the
            first truly open, verifiable, and transparent exchange.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/careers/search">
              <Button size="lg" className="rounded-full h-12 px-8 text-base">
                View Open Roles <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-8 text-base"
            >
              Read our Manifesto
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Stats Section - Background: Muted/30 */}
      <section className="py-24 px-6 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-card border border-border"
              >
                <stat.icon className="w-8 h-8 mb-4 text-primary opacity-80" />
                <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Mission / Split Content - Background: Background */}
      <section className="py-24 px-6 bg-background border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground">
                We are rewriting the <br /> rules of exchange.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Traditional finance is built on black boxes and trusted
                intermediaries. We are replacing trust with verification. Our
                platform allows anyone to verify solvency, execution, and
                fairness in real-time.
              </p>
              <ul className="space-y-4 pt-2">
                {[
                  'Auditable Matching Engine',
                  'Proof of Solvency',
                  'Community Governance',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-foreground font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button variant="secondary" className="rounded-full">
                  Read the Whitepaper
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full aspect-square md:aspect-video bg-muted/50 rounded-2xl border border-border flex items-center justify-center relative overflow-hidden group">
              {/* Abstract visualization */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              <div className="w-3/4 h-3/4 border border-primary/20 rounded-xl relative rotate-3 group-hover:rotate-0 transition-all duration-700 bg-card shadow-2xl p-6 flex flex-col gap-4">
                <div className="w-1/2 h-4 bg-muted rounded-full animate-pulse" />
                <div className="w-full h-32 bg-muted/50 rounded-lg" />
                <div className="flex gap-4">
                  <div className="w-1/3 h-4 bg-primary/20 rounded-full" />
                  <div className="w-1/3 h-4 bg-muted rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Values Section - Background: Muted/30 */}
      <section className="py-24 px-6 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              These are the principles that guide our decisions and shape our
              culture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Benefits Section - Background: Background */}
      <section className="py-24 px-6 bg-background border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Why Join Us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We take care of our team so they can focus on building the
              impossible.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section - Background: Muted/30 */}
      <section className="py-24 px-6 bg-muted/30 border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Hear from the Builders
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              What it's really like to work at the bleeding edge of fintech.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-card p-8 rounded-2xl border border-border flex flex-col gap-6 shadow-sm"
              >
                <div className="flex gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground text-lg font-medium leading-relaxed flex-1 italic">
                  &ldquo;{t.q}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {t.a[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.a}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA - Background: Background */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Ready to make an impact?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check out our open positions and find your place in the future of
            finance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/careers/search">
              <Button size="lg" className="rounded-full h-14 px-10 text-lg">
                Explore Opportunities <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
