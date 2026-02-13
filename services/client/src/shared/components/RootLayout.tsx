import 'src/styles/globals.css';
import { ThemeProvider } from 'src/shared/components/ThemeProvider';
import { cn } from 'src/shared/components/cn';
import { fontSans } from 'src/shared/components/fonts';
import { Toaster } from 'src/shared/components/ui/toaster';
import { ClientProviders } from 'src/shared/components/ClientProviders';
import RQProvider from 'src/shared/components/reactQuery/RQProvider';
import { getDictionary } from 'src/translation/getDictionary';
import { defaultLocale } from 'src/translation/locales';
import { cookies } from 'next/headers';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';
import { cookieGet } from 'src/shared/lib/cookie';
import { Viewport } from 'next';
import Script from 'next/script';
import { Footer } from '@/components';
import { PublicThemeProvider } from '@/components/theme-provider-public';
import { PublicDesignSystem } from '@/providers/design-system-public';

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
    <>
      <html lang={locale} suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            fontSans.variable,
          )}
        >
          <ClientProviders>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <RQProvider>
                <PublicThemeProvider
                  enableSystem
                  attribute="class"
                  defaultTheme="dark"
                  disableTransitionOnChange
                >
                  <PublicDesignSystem>
                    {/* 
                          Todo:
                          Fix Hydration error warning.
                        */}
                    {/* <PublicNavbar currentUser={context.currentUser} /> */}
                    <main>
                      <div className="relative flex min-h-screen flex-col">
                        <div className="flex-1">{children}</div>
                      </div>
                    </main>
                    <Footer />
                  </PublicDesignSystem>
                </PublicThemeProvider>
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

          gtag('config', 'G-MFFQRL807K');
        `}
        </Script>
      </html>
    </>
  );
}
