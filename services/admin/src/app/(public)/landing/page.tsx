'use client';

import React from 'react';
import Link from 'next/link';
import {
  Button,
  Typewriter,
  SpotlightCard,
  ShadowParticles,
  RippleSection,
} from '@/components/ui';
import { CodeWindow } from '@/components/code-window';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <ShadowParticles seed={12345} />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tight">
            Trade the Future
          </h1>
          <div className="text-2xl md:text-4xl text-muted-foreground font-light h-20">
            <span>Access </span>
            <span className="text-on-surface-variant font-medium">
              <Typewriter
                loop
                typeSpeed={70}
                deleteSpeed={50}
                delayBetween={2000}
                strings={[
                  'Stocks & ETFs',
                  'Options Strategies',
                  'Futures Contracts',
                  'Crypto Assets',
                ]}
              />
            </span>
          </div>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            The world's most advanced exchange platform. Lightning fast
            execution, institutional-grade security, and deep liquidity across
            all asset classes.
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

      {/* Features Grid */}
      <section className="py-24 bg-surface-variant/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              One Platform, Every Asset
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unified account management for all your trading needs. Experience
              seamless transitions between traditional and digital markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="Stocks"
              description="Trade thousands of global equities with zero commission on select markets. Real-time data and advanced charting."
              icon="stocks"
            />
            <FeatureCard
              title="Options"
              description="Execute complex options strategies with our intuitive interface. Risk management tools built right in."
              icon="options"
            />
            <FeatureCard
              title="Futures"
              description="Hedge your portfolio with competitive futures contracts. High leverage options available for qualified traders."
              icon="futures"
            />
            <FeatureCard
              title="Crypto"
              description="Buy, sell, and earn on top cryptocurrencies. Industry-leading cold storage security and insurance."
              icon="crypto"
            />
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
                Bank-Grade Security
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
                Your Assets, Protected.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We employ the most advanced security measures available to
                ensure your funds and personal information are always safe.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  '98% of assets held in cold storage',
                  'Real-time fraud monitoring & prevention',
                  'Proof of Reserves audits every quarter',
                  'SOC 2 Type II Certified',
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
                Developers First
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
                Build on a Powerful Foundation
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect to our high-performance matching engine via REST or
                WebSocket. Designed for algorithmic traders who demand speed and
                reliability.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">Low Latency</h4>
                  <p className="text-sm text-muted-foreground">
                    &lt;50ms average execution time
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-variant/30 border border-outline-variant/50">
                  <h4 className="font-semibold mb-1">WebSocket API</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time market data streaming
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
                <Link href="/api-docs">
                  <Button variant="primary">Read Documentation</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <RippleSection
        themes={['#0F172A', '#1E293B', '#334155']}
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
      </RippleSection>
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
  icon: 'stocks' | 'crypto' | 'futures' | 'options';
}) {
  return (
    <SpotlightCard
      className="bg-surface border border-outline-variant rounded-2xl p-8 h-full flex flex-col group"
      spotlightColor="rgba(103, 80, 164, 0.15)"
    >
      <div className="mb-6 p-3 bg-surface-variant w-fit rounded-xl text-primary">
        {icon === 'stocks' && (
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
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        )}
        {icon === 'crypto' && (
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
            <path d="M6 6h8a3 3 0 0 1 0 6a3 3 0 0 1 0 6h-8" />
            <line x1="8" x2="8" y1="6" y2="18" />
            <line x1="8" x2="14" y1="12" y2="12" />
            <line x1="9" x2="9" y1="3" y2="6" />
            <line x1="13" x2="13" y1="3" y2="6" />
            <line x1="9" x2="9" y1="18" y2="21" />
            <line x1="13" x2="13" y1="18" y2="21" />
          </svg>
        )}
        {icon === 'futures' && (
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
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        )}
        {icon === 'options' && (
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
