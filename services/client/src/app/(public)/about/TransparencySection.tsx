'use client';

import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Activity,
  BookOpen,
  Trophy,
  BarChart,
  Cpu,
  Users,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transparencyParts = [
  {
    part: 'III',
    title: 'Credibility via Artifacts',
    desc: 'How we leverage read-only demos, live dashboards, and public artifacts to demonstrate that the system works.',
    icon: FileText,
  },
  {
    part: 'IV',
    title: 'The Public Security Challenge',
    desc: 'Our security model and public “hack me” challenge — letting ethical hackers explore the system.',
    icon: Lock,
  },
  {
    part: 'V',
    title: 'Operational Transparency',
    desc: 'How our infrastructure, dashboards, and live metrics reveal system performance and efficiency.',
    icon: Activity,
  },
  {
    part: 'IX',
    title: 'Lessons from Engagement',
    desc: 'A recap of “hack me” and stress tests — what participants tried, what broke, and what was fixed.',
    icon: BookOpen,
  },
  {
    part: 'XVI',
    title: 'Gamifying Transparency',
    desc: 'Using security challenges, stress tests, and live experiments to engage the community and build trust.',
    icon: Trophy,
  },
  {
    part: 'XVII',
    title: 'Metrics that Matter',
    desc: 'Sharing live metrics like orders per hour, trades executed, uptime, and scaling events.',
    icon: BarChart,
  },
  {
    part: 'XXV',
    title: 'Load & Stress Test Data',
    desc: 'Publicly sharing results from stress and load tests — latency, autoscaling, and real-world performance.',
    icon: Cpu,
  },
  {
    part: 'XXVI',
    title: 'User Growth & Engagement',
    desc: 'Aggregated metrics on active users, orders per hour, and trades executed — showing adoption.',
    icon: Users,
  },
];

export function TransparencySection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-24 px-6 bg-primary/5 border-b border-border/40 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Radical Transparency
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg mx-auto">
            Metrics, challenges, and artifacts that prove our claims.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar / Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {transparencyParts.map((item, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    'text-left px-4 py-4 rounded-xl transition-all duration-300 border flex items-center justify-between group',
                    isActive
                      ? 'bg-background border-primary/50 shadow-md translate-x-2'
                      : 'bg-transparent border-transparent hover:bg-background/50 hover:border-border/50 text-muted-foreground hover:text-foreground',
                  )}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span className="font-medium text-sm md:text-base">
                    {item.title}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary animate-in fade-in slide-in-from-left-2 duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8 min-h-[400px]">
            <div className="bg-background/60 backdrop-blur-md rounded-3xl border border-border/50 p-8 md:p-12 h-full shadow-lg relative overflow-hidden">
              {/* Background pattern for content area */}
              <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:16px_16px] opacity-50"></div>

              {transparencyParts.map((item, index) => {
                if (activeTab !== index) return null;

                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="relative z-10 h-full flex flex-col animate-in fade-in zoom-in-95 duration-500"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-primary/80 mb-1 px-2 py-0.5 rounded bg-primary/5 inline-block border border-primary/10">
                          PART {item.part}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-xl leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-auto pt-12 flex items-center text-primary font-medium group cursor-pointer w-fit">
                      Learn more about {item.title}{' '}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
