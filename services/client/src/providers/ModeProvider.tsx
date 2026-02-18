'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';

export function ModeProvider({
  children,
  ...props
}: React.ComponentProps<typeof ThemeProvider>) {
  // For public pages, we don’t gate mount or localStorage
  // We just use a default theme, optionally enable system
  // Everything renders immediately, so SSR matches
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
