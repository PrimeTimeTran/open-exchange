import React from 'react';
import {
  LayoutTemplate,
  Shield,
  Zap,
  Activity,
  Globe,
  Database,
  Server,
  Code,
  Users,
  Eye,
  Lock,
  LineChart,
  Megaphone,
  Rocket,
  Terminal,
  FileText,
  Trophy,
  Cpu,
  BookOpen,
  BarChart,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import { TransparencySection } from './TransparencySection';

const visionParts = [
  {
    part: 'I',
    title: 'The Vision & First Principles',
    desc: 'Why we’re building in public, the principles guiding our decisions, and how we focus on real relationships with users, collaborators, and investors.',
    icon: Globe,
  },
  {
    part: 'VI',
    title: 'Designing for Skeptics',
    desc: 'Why modern systems should be built for people who doubt claims by default — and how designing for skeptics produces better architectures.',
    icon: Shield,
  },
  {
    part: 'X',
    title: 'The Future of Transparent Exchanges',
    desc: 'Our vision for a public, transparent exchange that builds trust with users, investors, and collaborators.',
    icon: Rocket,
  },
  {
    part: 'XIII',
    title: 'The Psychology of Transparency',
    desc: 'Why visible systems, dashboards, and metrics build trust, influence perception, and foster collaboration.',
    icon: Eye,
  },
  {
    part: 'XX',
    title: 'The Long-Term Vision',
    desc: 'Positioning the platform as part of a larger ecosystem — showing how transparency and strategic GTM thinking set the stage for growth.',
    icon: LayoutTemplate,
  },
];

const architectureParts = [
  {
    part: 'II',
    title: 'Understanding the Architecture',
    desc: 'A walkthrough of the platform’s architecture — how clients, services, and data layers interact.',
    bullets: [
      'Client-Side Architecture',
      'Service Communication',
      'Data Layer Interactions',
    ],
    icon: Server,
  },
  {
    part: 'VII',
    title: 'Token Mechanics & Integration',
    desc: 'How users connect wallets, deposit and withdraw funds, and trade tokens — demonstrating end-to-end flows.',
    bullets: [
      'Wallet Integration',
      'Deposit & Withdrawal Flows',
      'Token Standards',
    ],
    icon: Code,
  },
  {
    part: 'VIII',
    title: 'Matching Engine & Settlement',
    desc: 'How orders are matched and trades finalized in real-time — showing the execution layer while reinforcing confidence.',
    bullets: [
      'Order Matching Logic',
      'Real-Time Settlement',
      'Execution Guarantees',
    ],
    icon: Zap,
  },
  {
    part: 'XXII',
    title: 'Infrastructure Decisions',
    desc: 'Why we chose our cloud architecture, databases, and deployment patterns — sharing trade-offs and metrics.',
    bullets: [
      'Cloud Provider Choices',
      'Database Selection',
      'Deployment Patterns',
    ],
    icon: Database,
  },
  {
    part: 'XXIV',
    title: 'Database & Optimization',
    desc: 'How query design and database optimization impact performance and cost — including examples and scaling insights.',
    bullets: ['Query Optimization', 'Performance Tuning', 'Scaling Insights'],
    icon: Activity,
  },
];

const operationsParts = [
  {
    part: 'XXI',
    title: 'Cost & Scaling Transparency',
    desc: 'Breaking down real operational costs — compute, databases, storage, and other services.',
    bullets: ['Compute Costs', 'Database Expenses', 'Storage Fees'],
  },
  {
    part: 'XXIII',
    title: 'Email & Notification Ops',
    desc: 'How we handle email campaigns, notifications, and communications at scale.',
    bullets: ['Email Campaigns', 'Notification Systems', 'Scale Handling'],
  },
  {
    part: 'XXVII',
    title: 'Security Investment',
    desc: 'How we allocate time, effort, and resources to security — audits, public challenges, and testing.',
    bullets: ['Security Audits', 'Public Challenges', 'Penetration Testing'],
  },
  {
    part: 'XXVIII',
    title: 'Build & Deployment Velocity',
    desc: 'Metrics on deployment frequency, feature iteration, and CI/CD efficiency.',
    bullets: ['Deployment Frequency', 'Feature Iteration', 'CI/CD Efficiency'],
  },
  {
    part: 'XXIX',
    title: 'Lessons for Founders',
    desc: 'Lessons from scaling, troubleshooting, and iterating on the system — actionable insights.',
    bullets: ['Scaling Lessons', 'Troubleshooting', 'Iteration Insights'],
  },
  {
    part: 'XXX',
    title: 'Tools & Services Costs',
    desc: 'A detailed breakdown of SaaS and cloud services powering the platform.',
    bullets: ['SaaS Costs', 'Cloud Services', 'Tooling Breakdown'],
  },
];

const growthParts = [
  {
    part: 'XI',
    title: 'Building for the Right Audience',
    desc: 'Why attracting the right users, partners, and collaborators is more valuable than cold outreach.',
    icon: Users,
  },
  {
    part: 'XII',
    title: 'Why Artifacts Attract',
    desc: 'How sharing real features, dashboards, and live system data demonstrates execution and builds credibility.',
    icon: FileText,
  },
  {
    part: 'XIV',
    title: 'MVP to Market: Testing',
    desc: 'Lessons from launching early and letting users interact with real workflows.',
    icon: Rocket,
  },
  {
    part: 'XV',
    title: 'High-Signal Marketing',
    desc: 'How proof-of-execution, working demos, and public artifacts generate attention and credibility.',
    icon: Megaphone,
  },
  {
    part: 'XVIII',
    title: 'Execution > Code',
    desc: 'Demonstrating that execution is the strongest signal of capability.',
    icon: Terminal,
  },
  {
    part: 'XIX',
    title: 'Credibility Without Hype',
    desc: 'How product transparency, public artifacts, and measurable execution serve as the marketing engine.',
    icon: Shield,
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 px-6 md:py-32 lg:px-8 border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm rounded-full border-primary/20 text-primary bg-primary/5 backdrop-blur-sm"
          >
            Our Manifesto
          </Badge>
          <h1 className="text-4xl md:text-7xl font-display font-bold tracking-tight text-foreground max-w-5xl mx-auto">
            Lessons in Building{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Trust in Public
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We are documenting every step of building the world's first truly
            open exchange. Here is our blueprint for transparency, architecture,
            and operations.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 px-6 bg-primary/5 border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              The Vision & Principles
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Why we build in public and how we design for skeptics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visionParts.map((item, index) => (
              <div
                key={index}
                className="group bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  {item.icon ? (
                    <item.icon className="w-6 h-6" />
                  ) : (
                    <Globe className="w-6 h-6" />
                  )}
                </div>
                <div className="text-xs font-mono text-primary/80 mb-2">
                  PART {item.part}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 bg-background border-b border-border/40 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 space-y-4 px-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              System Architecture
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Technical deep dives into how we ensure reliability and speed.
            </p>
          </div>
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-8 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-x-auto gap-12 pb-8 px-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {architectureParts.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col min-w-[300px] md:min-w-[400px] snap-center"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon ? (
                        <item.icon className="w-5 h-5" />
                      ) : (
                        <Server className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs font-mono text-primary">
                      PART {item.part}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  {item.bullets && (
                    <ul className="space-y-2 mt-auto pt-4 border-t border-border/50">
                      {item.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-start text-sm text-muted-foreground/80"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <TransparencySection />

      {/* Operations Section */}
      <section className="py-24 px-6 bg-background border-b border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Operational Rigor
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg mx-auto">
              The costs, tools, and lessons of running at scale.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {operationsParts.map((item, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-mono text-primary">
                    PART {item.part}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {item.desc}
                </p>
                {item.bullets && (
                  <div className="mt-auto">
                    <div className="h-px bg-border/50 w-full mb-4"></div>
                    <ul className="space-y-2">
                      {item.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2"></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Section */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              High-Signal Growth
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg mx-auto">
              Marketing through execution, not hype.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {growthParts.map((item, index) => (
              <div
                key={index}
                className="group relative bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm flex flex-col overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    {item.icon ? (
                      <item.icon className="w-5 h-5" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-primary mb-2">
                    PART {item.part}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-background border-t border-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <h2 className="text-4xl font-display font-bold">
            Join the Revolution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are looking for builders who believe that the future of finance
            should be open, transparent, and verifiable.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full h-14 px-10 text-lg shadow-lg shadow-primary/20"
            >
              View Open Roles
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-10 text-lg hover:bg-muted/50"
            >
              Read the Whitepaper
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
