'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  BarChart3,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AnimatedGradientSection } from '@/components/ui/animated-gradient-section';

export default function ListingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Rocket className="mr-2 h-4 w-4" />
            Launch with us
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
            List Your Token on <br className="hidden md:inline" />
            Open Exchange
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Join the world's fastest-growing digital asset exchange. Access
            millions of users, deep liquidity, and institutional-grade security.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listing/apply">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Apply to List <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold">2M+</h3>
              <p className="text-primary-foreground/80 font-medium">
                Verified Users
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold">$10B+</h3>
              <p className="text-primary-foreground/80 font-medium">
                Quarterly Volume
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold">150+</h3>
              <p className="text-primary-foreground/80 font-medium">
                Countries Supported
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold">&lt;50ms</h3>
              <p className="text-primary-foreground/80 font-medium">Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why List With Us?
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-lg">
              We provide the infrastructure and support you need to grow your
              project's reach and liquidity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Reach</h3>
              <p className="text-muted-foreground">
                Gain exposure to millions of traders across 150+ countries. Our
                localized marketing campaigns help you reach new communities.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">High Performance</h3>
              <p className="text-muted-foreground">
                Our matching engine handles millions of transactions per second
                with microsecond latency, ensuring your market stays liquid even
                during volatility.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-muted-foreground">
                We employ multi-layer security protocols, cold storage for
                assets, and rigorous risk management to keep your community's
                funds safe.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
              <p className="text-muted-foreground">
                Get a dedicated account manager and 24/7 technical support.
                We're here to help you navigate every step of the listing
                process.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Access detailed market insights, trading volume data, and user
                demographics to better understand your token's performance.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-border bg-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Launchpad Access</h3>
              <p className="text-muted-foreground">
                Opportunity to be featured on our Launchpad for initial token
                offerings (IEOs), giving you a massive marketing boost.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Listing Process Section */}
      <section className="py-20 bg-surface-variant/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Listing Process
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-lg">
              A transparent and efficient path to getting your token listed.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-outline-variant z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-primary flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Application</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your project details via our secure application portal.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-primary flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Review</h3>
                <p className="text-sm text-muted-foreground">
                  Our team conducts due diligence on your project, team, and
                  tech.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-primary flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Technical setup, wallet integration, and market making
                  configuration.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-background border-4 border-primary flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-lg">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Your token goes live with a coordinated marketing campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Options */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Flexible Listing Options
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We support a wide range of blockchain standards and can
                accommodate custom integration requirements.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">ERC-20 & EVM Chains</h4>
                    <p className="text-sm text-muted-foreground">
                      Seamless support for Ethereum, BSC, Polygon, Avalanche,
                      and more.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Layer 1 Integrations</h4>
                    <p className="text-sm text-muted-foreground">
                      Native support for Solana, Cardano, Polkadot, and other
                      major L1s.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Custom Token Standards</h4>
                    <p className="text-sm text-muted-foreground">
                      Our engineering team can work with you to support unique
                      token mechanics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl transform rotate-3 blur-xl"></div>
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">
                      Ethereum
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ERC-20
                    </span>
                  </div>
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">BSC</span>
                    <span className="text-xs text-muted-foreground">
                      BEP-20
                    </span>
                  </div>
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">
                      Solana
                    </span>
                    <span className="text-xs text-muted-foreground">SPL</span>
                  </div>
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">
                      Polygon
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ERC-20
                    </span>
                  </div>
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">
                      Avalanche
                    </span>
                    <span className="text-xs text-muted-foreground">
                      C-Chain
                    </span>
                  </div>
                  <div className="bg-surface-variant/50 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold mb-1">
                      Arbitrum
                    </span>
                    <span className="text-xs text-muted-foreground">L2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedGradientSection className="py-24 text-center">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-foreground">
            Ready to grow your project?
          </h2>
          <p className="mx-auto mb-8 max-w-[600px] text-lg text-muted-foreground">
            Apply today and let's build the future of finance together.
          </p>
          <Link href="/listing/apply">
            <Button size="lg" variant="primary">
              Start Application
            </Button>
          </Link>
        </div>
      </AnimatedGradientSection>
    </div>
  );
}
