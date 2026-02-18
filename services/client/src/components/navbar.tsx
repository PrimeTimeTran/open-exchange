'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FeedbackModal } from './feedback-modal';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import {
  Moon,
  Sun,
  User,
  LogIn,
  Wallet,
  LogOut,
  Settings,
  UserPlus,
  MessageSquarePlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

export function Navbar({ currentUser }: { currentUser?: any }) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="w-full border-b border-outline-variant bg-surface transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/home"
              className="px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/investing"
              className="px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
            >
              Investing
            </Link>
            <Link
              href="/crypto"
              className="px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
            >
              Crypto
            </Link>
            {currentUser && (
              <>
                <Link
                  href="/notifications"
                  className="px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
                >
                  Notifications
                </Link>
                <Link
                  href="/account"
                  className="px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 transition-colors"
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
                    className="relative rounded-full p-1 hover:bg-primary/20 transition-colors outline-none"
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
                          href="/auth/sign-in"
                          className="cursor-pointer w-full text-success"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          <span>Sign In</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/sign-up"
                          className="cursor-pointer w-full text-success"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Create Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={() => setIsFeedbackOpen(true)}
                    className="cursor-pointer"
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    <span>Feedback & Bugs</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
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
                      {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
                    </span>
                  </DropdownMenuItem>
                  {currentUser && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-error focus:text-error cursor-pointer"
                        onClick={() => {
                          authSignOutApiCall();
                          window.location.href = '/auth/sign-in';
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4 text-error" />
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
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
}
