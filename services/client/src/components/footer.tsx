import Link from 'next/link';
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant bg-surface-variant/30 text-on-surface-variant">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/home" className="inline-block">
              <h3 className="text-xl font-bold tracking-tight text-primary hover:text-primary/80 transition-colors">
                Open Exchange
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The next-generation trading platform for stocks, crypto, futures,
              and options. Secure, fast, and built for everyone.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink
                href="https://twitter.com"
                icon={Twitter}
                label="Twitter"
              />
              <SocialLink
                href="https://github.com"
                icon={Github}
                label="GitHub"
              />
              <SocialLink
                href="https://linkedin.com"
                icon={Linkedin}
                label="LinkedIn"
              />
            </div>
          </div>

          {/* Markets Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-on-surface">Markets</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/markets/stocks">Stocks & ETFs</FooterLink>
              <FooterLink href="/markets/crypto">Cryptocurrency</FooterLink>
              <FooterLink href="/markets/futures">Futures</FooterLink>
              <FooterLink href="/markets/options">Options</FooterLink>
              <FooterLink href="/listings">New Listings</FooterLink>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-on-surface">Support</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/api-docs">API Documentation</FooterLink>
              <FooterLink href="/fees">Fee Schedule</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
              <FooterLink href="/status">System Status</FooterLink>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-on-surface">Company</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/articles">Articles</FooterLink>
              <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/legal/terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Open Exchange, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full bg-surface hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

export default Footer;
