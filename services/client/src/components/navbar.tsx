'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import {
  Moon,
  Sun,
  User,
  Wallet,
  LogOut,
  Laptop,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlobalSidebar } from './global-sidebar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
// } from '@/components/ui/dropdown-menu';

export function Navbar({ currentUser }: { currentUser?: any }) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="w-full border-b border-outline-variant bg-surface transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          {/* <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-full text-on-surface hover:bg-surface-variant transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/home">
              <div className="font-semibold text-on-surface">OpenExchange</div>
            </Link>
          </div> */}

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/home"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Home
            </Link>
            <Link
              href="/investing"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Investing
            </Link>
            <Link
              href="/crypto"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Crypto
            </Link>
            {currentUser && (
              <>
                <Link
                  href="/notifications"
                  className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Notifications
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Account
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative rounded-full p-1 hover:bg-surface-variant transition-colors outline-none"
                    aria-label="User menu"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <User className="h-5 w-5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {currentUser ? (
                    <>
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {currentUser.fullName || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer w-full">
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Accounts, Wallets & Funds</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signin"
                          className="cursor-pointer w-full"
                        >
                          <span>Sign In</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signup"
                          className="cursor-pointer w-full"
                        >
                          <span>Create Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                    }
                  >
                    {resolvedTheme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    <span>
                      Toggle to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}{' '}
                      Mode
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>

                  {currentUser && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => {
                          authSignOutApiCall();
                          window.location.href = '/auth/sign-in';
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      <GlobalSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
}
