'use client';

import Link from 'next/link';
import { Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { GlobalSidebar } from './global-sidebar';

export function PublicNavbar({ currentUser }: { currentUser?: any }) {
  // Public pages: no sidebar toggle, sidebar always closed
  const [isSidebarOpen] = useState(false);

  // Theme toggle: optional, can be hidden or static
  const showThemeToggle = false; // for public pages, hide toggle

  return (
    <>
      <nav className="w-full border-b border-outline-variant bg-surface transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-on-surface opacity-50" />
            <Link href="/home">
              <div className="font-semibold text-on-surface">OpenExchange</div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/design-kit"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface"
            >
              Design Kit
            </a>

            {showThemeToggle && (
              <button
                onClick={() => {}}
                className="relative rounded-full p-2 hover:bg-surface-variant transition-colors"
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-warning" />
                <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* SSR-safe sidebar shell */}
      <GlobalSidebar
        isOpen={false} // never open on public pages
        onClose={() => {}}
        currentUser={currentUser}
      />
    </>
  );
}
