import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ArrowRight, ShieldCheck, Zap, Globe, Banknote } from 'lucide-react';

export const metadata = {
  title: 'Send Crypto, Receive VND | Fast Off-Ramp to Vietnam',
  description:
    'Turn your crypto into Vietnamese đồng instantly. No complexity, just a simple swap and a direct bank payout.',
};

export default function FXExchangePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container relative px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6 bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent pb-2">
              Send Crypto. Receive VND.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The{' '}
              <span className="text-foreground font-semibold">
                Uber for cash settlement
              </span>
              . We offer a white-glove{' '}
              <span className="text-foreground font-semibold">
                concierge service
              </span>{' '}
              to turn your crypto into Vietnamese đồng directly to your bank
              account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14" asChild>
                <Link href="/dashboard/deposit">
                  Start Transfer <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                View Rates
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Supports USDT (ERC20, TRC20) • BTC • ETH
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface-variant/20 border-y border-border/50">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Simple. Direct. Reliable.
            </h2>
            <p className="text-lg text-muted-foreground">
              Crypto in. VND out. No complicated flow. No unnecessary steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Concierge Service"
              description="Start a request. We provide a secure wallet address and dedicated support for your transaction."
              icon={Zap}
            />
            <StepCard
              number="2"
              title="We confirm transaction"
              description="Once it’s on-chain, it’s verified automatically by our system."
              icon={ShieldCheck}
            />
            <StepCard
              number="3"
              title="Receive VND"
              description="Get paid directly to your Vietnamese bank account in 5–15 minutes."
              icon={Banknote}
            />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                Built for Speed & Trust
              </h2>
              <ul className="space-y-6">
                <FeatureItem
                  title="Fast Confirmations"
                  description="Bank transfers typically complete within 5-15 minutes after blockchain confirmation."
                />
                <FeatureItem
                  title="Transparent Fees"
                  description="Clear exchange rate locked at the moment of transaction. You know exactly what you get."
                />
                <FeatureItem
                  title="Direct Transfer"
                  description="Funds go straight to your local bank account. No intermediate wallets required."
                />
                <FeatureItem
                  title="Secure & Compliant"
                  description="We prioritize safety and stability, ensuring your funds are handled with institutional-grade security."
                />
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20" />
              <SpotlightCard className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        T
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Send USDT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          TRC20 Network
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">1,000.00</div>
                      <div className="text-xs text-muted-foreground">USDT</div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-surface border border-border rounded-full p-2 text-muted-foreground">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                        V
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Receive VND
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bank Transfer
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        25,450,000
                      </div>
                      <div className="text-xs text-muted-foreground">VND</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium text-foreground">
                        1 USDT ≈ 25,450 VND
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Time</span>
                      <span className="font-medium text-foreground">
                        ~5 Mins
                      </span>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-lg">Exchange Now</Button>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border bg-surface-variant/10">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            Who It’s For
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 rounded-xl bg-card border border-border">
              <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Remote Workers</h3>
              <p className="text-sm text-muted-foreground">
                Paid in USDT or BTC? Cash out instantly for daily expenses.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Banknote className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Traders</h3>
              <p className="text-sm text-muted-foreground">
                Securely realize your trading profits into fiat currency.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Crypto Holders</h3>
              <p className="text-sm text-muted-foreground">
                Need liquidity? Get VND without navigating complex exchanges.
              </p>
            </div>
          </div>
          <div className="max-w-xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Start your transfer now.
            </h3>
            <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg">
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <SpotlightCard className="relative h-full bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
      <div className="absolute top-6 right-6 text-6xl font-bold text-foreground/5 pointer-events-none select-none">
        {number}
      </div>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </SpotlightCard>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="mt-1 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-success" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground text-lg">{title}</h4>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
