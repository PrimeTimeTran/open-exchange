'use client';

import React from 'react';
import Link from 'next/link';
import {
  Button,
  Typewriter,
  SpotlightCard,
  ShadowParticles,
} from '@/components/ui';
import { CodeWindow } from '@/components/code-window';
import { MarketTicker } from '@/components/landing/market-ticker';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <ShadowParticles />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tight">
            The World's First <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Open Exchange
            </span>
          </h1>
          <div className="text-2xl md:text-4xl text-muted-foreground font-light h-20">
            <span>No walled gardens. Just </span>
            <span className="text-on-surface-variant font-medium">
              <Typewriter
                typeSpeed={70}
                deleteSpeed={50}
                delayBetween={2000}
                strings={[
                  'Radical Transparency.',
                  'Public Architecture.',
                  'Verifiable Trust.',
                  'Community Driven.',
                ]}
              />
            </span>
          </div>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            We're building the financial infrastructure of tomorrow in public.
            Open source, audible, and designed for skeptics. Join the revolution
            against black boxes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/auth/register">
              <Button size="lg" variant="primary" className="min-w-[160px]">
                Start Trading
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="min-w-[160px]">
                View Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Markets Ticker */}
      <MarketTicker />

      {/* Principles Grid */}
      <section className="py-24 bg-surface-variant/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              Built on First Principles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe trust is earned, not given. That's why we operate
              differently from traditional "walled garden" tech companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="Built in Public"
              description="We share our journey, decisions, and code. Watch us build, break, and fix things in real-time."
              icon="git-branch"
            />
            <FeatureCard
              title="Designed for Skeptics"
              description="Don't trust us? You don't have to. Our architecture is open for inspection and verification by anyone."
              icon="shield-check"
            />
            <FeatureCard
              title="Public Artifacts"
              description="Live dashboards, real-time metrics, and 'hack me' challenges. We prove our reliability every single day."
              icon="layout"
            />
            <FeatureCard
              title="No Walled Gardens"
              description="Your data is yours. Deep interoperability and open APIs mean you're never locked in."
              icon="globe"
            />
          </div>
        </div>
      </section>

      {/* Pro Interface Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              Professional Grade Interface
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Designed for speed and precision. Customizable workspaces,
              real-time depth charts, and advanced order types at your
              fingertips.
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-outline-variant shadow-2xl bg-[#0F172A] w-full max-w-5xl mx-auto group flex flex-col md:aspect-video h-auto">
            {/* Mock UI Header */}
            <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="ml-4 h-6 px-3 bg-white/10 rounded text-xs text-white/70 flex items-center">
                  BTC-USD
                </div>
              </div>
              <div className="text-xs text-white/50 font-mono">
                Connected: 14ms
              </div>
            </div>

            {/* Mock UI Body */}
            <div className="flex flex-col md:flex-row h-full p-1 text-xs text-white/70 font-mono">
              {/* Left Panel: Orderbook */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-64 md:h-auto order-2 md:order-1">
                <div className="p-2 border-b border-white/10 font-bold text-white">
                  Order Book
                </div>
                <div className="flex-1 overflow-hidden p-2 space-y-0.5">
                  {[...Array(12)]
                    .map((_, i) => (
                      <div
                        key={`ask-${i}`}
                        className="flex justify-between text-red-400"
                      >
                        <span>{(43250 + i * 5).toFixed(2)}</span>
                        <span>{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                    ))
                    .reverse()}
                  <div className="py-2 text-center text-lg font-bold text-white border-y border-white/10 my-2">
                    43,240.50
                  </div>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={`bid-${i}`}
                      className="flex justify-between text-green-400"
                    >
                      <span>{(43230 - i * 5).toFixed(2)}</span>
                      <span>{(Math.random() * 2).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Panel: Chart Placeholder */}
              <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/10 min-h-[300px] md:min-h-0 order-1 md:order-2">
                <div className="h-10 border-b border-white/10 flex items-center px-4 gap-4">
                  <span className="text-white font-bold">Timeframe:</span>
                  <span className="cursor-pointer hover:text-white">1m</span>
                  <span className="cursor-pointer text-white">5m</span>
                  <span className="cursor-pointer hover:text-white">15m</span>
                  <span className="cursor-pointer hover:text-white">1h</span>
                </div>
                <div className="flex-1 relative bg-gradient-to-b from-transparent to-primary/5 p-8 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-end justify-around px-8 pb-8 opacity-30">
                    {[40, 60, 45, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="w-full mx-1 bg-primary/40 rounded-t-sm"
                      />
                    ))}
                  </div>
                  {/* SVG Line Chart Overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full p-8"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      points="0,300 100,250 200,280 300,150 400,180 500,100 600,120 700,50 800,80 900,20"
                    />
                  </svg>
                </div>
              </div>

              {/* Right Panel: Order Entry */}
              <div className="w-full md:w-72 flex flex-col bg-white/5 order-3">
                <div className="flex border-b border-white/10">
                  <div className="flex-1 p-3 text-center bg-green-500/20 text-green-400 font-bold border-b-2 border-green-500">
                    Buy
                  </div>
                  <div className="flex-1 p-3 text-center hover:bg-white/5 cursor-pointer">
                    Sell
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase">Order Type</div>
                    <div className="p-2 bg-black/40 rounded border border-white/10">
                      Limit
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase">Price (USD)</div>
                    <div className="p-2 bg-black/40 rounded border border-white/10">
                      43,240.50
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase">Amount (BTC)</div>
                    <div className="p-2 bg-black/40 rounded border border-white/10">
                      0.5
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded">
                      Place Buy Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section className="py-24 bg-background border-y border-outline-variant/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                $10B+
              </div>
              <div className="text-muted-foreground">Quarterly Volume</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                &lt;50ms
              </div>
              <div className="text-muted-foreground">Average Latency</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                2M+
              </div>
              <div className="text-muted-foreground">Verified Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-surface-variant/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Public Security Challenge
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
                Robustness via Transparency
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We invite ethical hackers to test our system. Our security model
                is public, our audits are published, and our bounties are paid.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Live "Hack Me" Challenges',
                  'Public Post-Mortems',
                  'Proof of Reserves audits every quarter',
                  'Open Source Security Models',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button variant="outline" className="gap-2">
                  View Security Report
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
              <SpotlightCard className="relative bg-background border border-outline-variant p-8 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-8 border-b border-outline-variant/50 pb-4">
                  <div className="font-mono text-sm text-muted-foreground">
                    SECURITY_STATUS
                  </div>
                  <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    OPERATIONAL
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cold Wallet</span>
                      <span className="font-mono">98.2%</span>
                    </div>
                    <div className="h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[98.2%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        System Uptime
                      </span>
                      <span className="font-mono">99.99%</span>
                    </div>
                    <div className="h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[99.99%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Threats Blocked
                      </span>
                      <span className="font-mono">24,892</span>
                    </div>
                    <div className="h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[65%]"></div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 bg-background overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 w-full order-2 lg:order-1">
              <CodeWindow
                filename="order_execution.py"
                language="python"
                code={`import exchange_api as client

# Initialize high-frequency client
api = client.HFT(
    api_key="pk_live_892...", 
    latency_mode="ultra_low"
)

# Subscribe to real-time orderbook
@api.on_quote('BTC-USD')
async def handle_tick(quote):
    if quote.spread < 0.5:
        # Execute sub-millisecond order
        await api.place_order(
            symbol="BTC-USD",
            side="buy",
            size=0.5,
            type="limit",
            price=quote.ask
        )

# Start event loop
api.start()`}
              />
            </div>
            <div className="lg:w-1/2 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Verify, Don't Trust
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
                Open Architecture
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Understand exactly how your orders are routed, matched, and
                settled. Our architecture is documented and observable by
                design.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">Observable</h4>
                  <p className="text-sm text-muted-foreground">
                    Live system metrics & dashboards
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">Open Source</h4>
                  <p className="text-sm text-muted-foreground">
                    Core components built in public
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">Fix Protocol</h4>
                  <p className="text-sm text-muted-foreground">
                    Standard institutional connectivity
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">Sandbox</h4>
                  <p className="text-sm text-muted-foreground">
                    Test strategies with zero risk
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <Link href="#">
                  <Button variant="primary">Read Documentation</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        // themes={['#0F172A', '#1E293B', '#334155']}
        className="py-32 text-center text-white cursor-pointer"
      >
        <div className="container mx-auto px-6 space-y-8 relative z-10 pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Ready to dive in?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join millions of traders worldwide and experience the next
            generation of financial technology.
          </p>
          <div className="pt-8 pointer-events-auto">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-gray-100 border-none"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 pt-4">
            (Click anywhere in this section for a ripple effect)
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: 'git-branch' | 'shield-check' | 'layout' | 'globe';
}) {
  return (
    <SpotlightCard
      className="bg-surface border border-outline-variant rounded-2xl p-8 h-full flex flex-col group"
      spotlightColor="rgba(103, 80, 164, 0.15)"
    >
      <div className="mb-6 p-3 bg-surface-variant w-fit rounded-xl text-primary">
        {icon === 'git-branch' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
          </svg>
        )}
        {icon === 'shield-check' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        )}
        {icon === 'layout' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <line x1="3" x2="21" y1="9" y2="9"></line>
            <line x1="9" x2="9" y1="21" y2="9"></line>
          </svg>
        )}
        {icon === 'globe' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" x2="22" y1="12" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        )}
      </div>
      <h3 className="text-xl font-bold mb-3 text-on-surface">{title}</h3>
      <p className="text-muted-foreground leading-relaxed flex-grow">
        {description}
      </p>
      <div className="mt-6 pt-6 border-t border-outline-variant/20 flex items-center text-primary font-medium group-hover:underline cursor-pointer">
        Learn more
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </SpotlightCard>
  );
}
