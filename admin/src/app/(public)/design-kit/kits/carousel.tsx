'use client'
import { useRef } from 'react'
import { cn } from '@/utils/utils'
import {
  Zap,
  Star,
  Plus,
  Minus,
  Users,
  Check,
  Trophy,
  Shield,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CarouselItemProps {
  title: string
  children: React.ReactNode
  className?: string
}

function CarouselItem({ title, children, className }: CarouselItemProps) {
  return (
    <div
      className={cn(
        'min-w-full h-[600px] bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col relative shrink-0 snap-center',
        className,
      )}
    >
      <div className='absolute top-4 left-4 z-10 bg-surface/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-outline-variant text-on-surface-variant'>
        {title}
      </div>
      <div className='w-full h-full overflow-y-auto'>{children}</div>
    </div>
  )
}

export function CarouselSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth + 24 // width + gap
      const newScrollLeft =
        direction === 'left'
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className='bg-background py-24 border-t border-outline-variant/50'>
      <div className='container mx-auto px-6 space-y-8'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h2 className='text-2xl font-semibold flex items-center gap-2'>
              <LayoutTemplate className='w-6 h-6 text-primary' />
              Section Carousel
            </h2>
            <p className='text-on-surface-variant text-sm max-w-2xl'>
              A showcase of common landing page sections arranged in a
              horizontal scrollable carousel. Each section is full-width and
              copy-paste ready.
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => scroll('left')}
              className='p-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors'
              aria-label='Scroll left'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              onClick={() => scroll('right')}
              className='p-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors'
              aria-label='Scroll right'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className='flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hero Section */}
          <CarouselItem
            title='Hero Section'
            className='bg-background'
          >
            <div className='h-full flex flex-col items-center justify-center text-center px-4 md:px-12 py-16 space-y-8'>
              <div className='inline-flex items-center rounded-full border border-outline-variant px-3 py-1 text-sm font-medium text-primary bg-surface-variant/50'>
                <span className='flex h-2 w-2 rounded-full bg-primary mr-2'></span>
                v2.0 is now available
              </div>
              <h1 className='text-4xl md:text-6xl font-bold tracking-tight text-on-surface max-w-4xl'>
                Build faster with our{' '}
                <span className='text-primary'>Design System</span>
              </h1>
              <p className='text-xl text-on-surface-variant max-w-2xl'>
                A complete set of components and primitives to build your next
                project. Beautifully designed, accessible, and easy to
                customize.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Button
                  size='lg'
                  className='rounded-full'
                >
                  Get Started <ArrowRight className='ml-2 w-4 h-4' />
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='rounded-full'
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </CarouselItem>

          {/* Features Grid */}
          <CarouselItem
            title='Features Grid'
            className='bg-surface-variant/10'
          >
            <div className='h-full flex items-center justify-center px-4 md:px-12 py-16'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl'>
                {[
                  {
                    icon: Zap,
                    title: 'Lightning Fast',
                    desc: 'Optimized for speed and performance across all devices.',
                  },
                  {
                    icon: Shield,
                    title: 'Secure by Default',
                    desc: 'Enterprise-grade security built into every component.',
                  },
                  {
                    icon: Activity,
                    title: 'Real-time Analytics',
                    desc: 'Track user engagement and metrics in real-time.',
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className='bg-surface p-8 rounded-2xl border border-outline-variant hover:border-primary/50 transition-colors shadow-sm'
                  >
                    <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary'>
                      <feature.icon className='w-6 h-6' />
                    </div>
                    <h3 className='text-xl font-bold mb-3'>{feature.title}</h3>
                    <p className='text-on-surface-variant leading-relaxed'>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CarouselItem>

          {/* Split Content */}
          <CarouselItem
            title='Split Content'
            className='bg-background'
          >
            <div className='h-full flex items-center px-4 md:px-12 py-16'>
              <div className='flex flex-col md:flex-row gap-12 items-center w-full max-w-6xl mx-auto'>
                <div className='flex-1 space-y-6'>
                  <h2 className='text-3xl md:text-4xl font-bold text-on-surface'>
                    Seamless integration with your workflow
                  </h2>
                  <p className='text-lg text-on-surface-variant'>
                    Connect your favorite tools and automate your processes. Our
                    platform plays nicely with the stack you already use.
                  </p>
                  <ul className='space-y-3 pt-2'>
                    {[
                      'One-click deployment',
                      'Automated CI/CD pipelines',
                      'Real-time collaboration',
                    ].map((item) => (
                      <li
                        key={item}
                        className='flex items-center gap-3 text-on-surface'
                      >
                        <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success'>
                          <Check className='w-3.5 h-3.5' />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className='pt-4'>
                    <Button variant='secondary'>
                      Learn more about integrations
                    </Button>
                  </div>
                </div>
                <div className='flex-1 w-full aspect-video bg-surface-variant/30 rounded-2xl border border-outline-variant flex items-center justify-center relative overflow-hidden group'>
                  <div className='absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                  <div className='w-2/3 h-2/3 bg-surface rounded-lg shadow-xl border border-outline-variant flex flex-col p-4 space-y-3 rotate-3 group-hover:rotate-0 transition-transform duration-500'>
                    <div className='w-full h-2 bg-surface-variant rounded-full' />
                    <div className='w-3/4 h-2 bg-surface-variant rounded-full' />
                    <div className='w-full h-32 bg-surface-variant/50 rounded mt-2' />
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Pricing */}
          <CarouselItem
            title='Pricing'
            className='bg-surface-variant/5'
          >
            <div className='h-full flex flex-col items-center justify-center px-4 md:px-12 py-16'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-center'>
                {/* Basic */}
                <div className='bg-surface p-8 rounded-2xl border border-outline-variant shadow-sm flex flex-col'>
                  <h3 className='text-lg font-medium text-on-surface-variant mb-2'>
                    Basic
                  </h3>
                  <div className='text-4xl font-bold mb-6'>
                    $0
                    <span className='text-base font-normal text-on-surface-variant'>
                      /mo
                    </span>
                  </div>
                  <ul className='space-y-4 mb-8 flex-1'>
                    {['1 Project', 'Community Support', 'Basic Analytics'].map(
                      (feat) => (
                        <li
                          key={feat}
                          className='flex items-center gap-3 text-sm'
                        >
                          <Check className='w-4 h-4 text-primary' /> {feat}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    variant='outline'
                    className='w-full'
                  >
                    Get Started
                  </Button>
                </div>

                {/* Pro */}
                <div className='bg-surface p-8 rounded-2xl border-2 border-primary shadow-lg flex flex-col relative scale-105 z-10'>
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full'>
                    MOST POPULAR
                  </div>
                  <h3 className='text-lg font-medium text-primary mb-2'>Pro</h3>
                  <div className='text-4xl font-bold mb-6'>
                    $29
                    <span className='text-base font-normal text-on-surface-variant'>
                      /mo
                    </span>
                  </div>
                  <ul className='space-y-4 mb-8 flex-1'>
                    {[
                      'Unlimited Projects',
                      'Priority Support',
                      'Advanced Analytics',
                      'Custom Domain',
                    ].map((feat) => (
                      <li
                        key={feat}
                        className='flex items-center gap-3 text-sm font-medium'
                      >
                        <Check className='w-4 h-4 text-primary' /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Button className='w-full'>Get Pro</Button>
                </div>

                {/* Enterprise */}
                <div className='bg-surface p-8 rounded-2xl border border-outline-variant shadow-sm flex flex-col'>
                  <h3 className='text-lg font-medium text-on-surface-variant mb-2'>
                    Enterprise
                  </h3>
                  <div className='text-4xl font-bold mb-6'>Custom</div>
                  <ul className='space-y-4 mb-8 flex-1'>
                    {[
                      'SSO Integration',
                      'Dedicated Manager',
                      'SLA Guarantee',
                    ].map((feat) => (
                      <li
                        key={feat}
                        className='flex items-center gap-3 text-sm'
                      >
                        <Check className='w-4 h-4 text-primary' /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant='outline'
                    className='w-full'
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Testimonials */}
          <CarouselItem
            title='Testimonials'
            className='bg-background'
          >
            <div className='h-full flex flex-col items-center justify-center px-4 md:px-12 py-16'>
              <div className='text-center mb-12 max-w-2xl mx-auto'>
                <h2 className='text-3xl font-bold mb-4'>Loved by developers</h2>
                <p className='text-on-surface-variant'>
                  Don't just take our word for it. Here's what the community has
                  to say about our tools.
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl'>
                {[
                  {
                    q: "The best developer experience I've had in years. It just works.",
                    a: 'Sarah Chen',
                    r: 'Senior Engineer',
                  },
                  {
                    q: 'Documentation is outstanding. I was up and running in minutes.',
                    a: 'Mark Davis',
                    r: 'Tech Lead',
                  },
                  {
                    q: 'Incredible performance improvements since we switched over.',
                    a: 'Alex Morgan',
                    r: 'CTO',
                  },
                ].map((t, i) => (
                  <div
                    key={i}
                    className='bg-surface p-6 rounded-xl border border-outline-variant flex flex-col gap-4'
                  >
                    <div className='flex gap-1 text-warning'>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className='w-4 h-4 fill-current'
                        />
                      ))}
                    </div>
                    <p className='text-on-surface text-lg font-medium leading-relaxed flex-1'>
                      &ldquo;{t.q}&rdquo;
                    </p>
                    <div className='flex items-center gap-3 pt-2'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold'>
                        {t.a[0]}
                      </div>
                      <div>
                        <div className='font-semibold text-sm'>{t.a}</div>
                        <div className='text-xs text-on-surface-variant'>
                          {t.r}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CarouselItem>

          {/* FAQ */}
          <CarouselItem
            title='FAQ'
            className='bg-surface-variant/5'
          >
            <div className='h-full flex items-center justify-center px-4 md:px-12 py-16'>
              <div className='w-full max-w-3xl space-y-8'>
                <div className='text-center space-y-2'>
                  <h2 className='text-3xl font-bold'>
                    Frequently Asked Questions
                  </h2>
                  <p className='text-on-surface-variant'>
                    Everything you need to know about the product and billing.
                  </p>
                </div>
                <div className='space-y-4'>
                  {[
                    {
                      q: 'Is there a free trial available?',
                      a: 'Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.',
                      open: true,
                    },
                    {
                      q: 'Can I change my plan later?',
                      a: 'Of course. Our pricing scales with your company. Chat to our friendly team to find a solution that works for you.',
                      open: false,
                    },
                    {
                      q: 'What is your cancellation policy?',
                      a: 'We understand that things change. You can cancel your plan at any time and we’ll refund you the difference already paid.',
                      open: false,
                    },
                    {
                      q: 'Do you offer an SLA?',
                      a: 'Yes, for our Enterprise customers we offer a 99.99% uptime SLA guarantee.',
                      open: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'bg-surface rounded-xl border transition-all duration-200 overflow-hidden',
                        item.open
                          ? 'border-primary shadow-sm'
                          : 'border-outline-variant hover:border-primary/50',
                      )}
                    >
                      <div className='flex items-center justify-between p-4 cursor-pointer'>
                        <span className='font-medium text-lg'>{item.q}</span>
                        {item.open ? (
                          <Minus className='w-5 h-5 text-primary' />
                        ) : (
                          <Plus className='w-5 h-5 text-on-surface-variant' />
                        )}
                      </div>
                      {item.open && (
                        <div className='px-4 pb-4 text-on-surface-variant leading-relaxed border-t border-outline-variant/50 pt-4'>
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Stats */}
          <CarouselItem
            title='Stats'
            className='bg-primary text-on-primary'
          >
            <div className='h-full flex flex-col items-center justify-center px-4 md:px-12 py-16 relative overflow-hidden'>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
              <div className='relative z-10 w-full max-w-6xl'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12'>
                  {[
                    {
                      label: 'Active Users',
                      value: '100k+',
                      icon: Users,
                    },
                    {
                      label: 'Countries',
                      value: '150+',
                      icon: Activity,
                    },
                    {
                      label: 'Uptime',
                      value: '99.9%',
                      icon: Zap,
                    },
                    {
                      label: 'Awards Won',
                      value: '24',
                      icon: Trophy,
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className='flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-on-primary/10 border border-on-primary/10 backdrop-blur-sm'
                    >
                      <stat.icon className='w-8 h-8 mb-4 opacity-80' />
                      <div className='text-4xl md:text-5xl font-bold mb-2 tracking-tight'>
                        {stat.value}
                      </div>
                      <div className='text-on-primary/70 font-medium'>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Newsletter */}
          <CarouselItem
            title='Newsletter'
            className='bg-primary text-on-primary'
          >
            <div className='h-full flex flex-col items-center justify-center px-4 md:px-12 py-16 text-center relative overflow-hidden'>
              {/* Background Pattern */}
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl' />
                <div className='absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl' />
              </div>

              <div className='relative z-10 max-w-2xl space-y-8'>
                <h2 className='text-3xl md:text-5xl font-bold'>
                  Stay ahead of the curve
                </h2>
                <p className='text-lg text-on-primary/80'>
                  Join 10,000+ developers receiving the latest updates,
                  tutorials, and resources directly to their inbox.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
                  <Input
                    placeholder='Enter your email'
                    className='bg-on-primary/10 border-on-primary/20 text-on-primary placeholder:text-on-primary/50 focus-visible:ring-on-primary'
                  />
                  <Button
                    variant='secondary'
                    className='whitespace-nowrap'
                  >
                    Subscribe Now
                  </Button>
                </div>
                <p className='text-xs text-on-primary/60'>
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </CarouselItem>
        </div>
      </div>
    </section>
  )
}
