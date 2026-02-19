import 'src/styles/globals.css';
import { Viewport } from 'next';
import Script from 'next/script';
import { Footer } from '@/components';
import { cookies } from 'next/headers';

import { cn } from 'src/shared/components/cn';
import { cookieGet } from 'src/shared/lib/cookie';
import { fontSans } from 'src/shared/components/fonts';
import { defaultLocale } from 'src/translation/locales';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'src/shared/components/ui/toaster';
import { DesignProvider } from '@/providers/DesignProvider';
import { getDictionary } from 'src/translation/getDictionary';
import { ClientProviders } from '@/providers/ClientProviders';
import RQProvider from 'src/shared/components/reactQuery/RQProvider';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: {
      default: dictionary.projectName,
      template: `%s - ${dictionary.projectName}`,
    },
    robots: {
      follow: true,
      index: true,
    },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = cookieGet(cookies(), 'locale') || defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
        )}
      >
        <ClientProviders>
          <ThemeProvider enableSystem attribute="class" defaultTheme="system">
            <RQProvider>
              <DesignProvider>
                <main>
                  <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">{children}</div>
                  </div>
                </main>
                <Footer />
              </DesignProvider>
            </RQProvider>
          </ThemeProvider>
        </ClientProviders>
        <Toaster />
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MFFQRL807K"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-MFFQRL807K', {
          user_id: 'root_user',
          tenant_id: 'root_tenant',
        });
      `}
      </Script>
    </html>
  );
}
