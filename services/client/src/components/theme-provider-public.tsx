'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function PublicThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // For public pages, we don’t gate mount or localStorage
  // We just use a default theme, optionally enable system
  // Everything renders immediately, so SSR matches
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
