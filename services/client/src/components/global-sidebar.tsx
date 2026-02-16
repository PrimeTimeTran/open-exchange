'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import {
  X,
  Home,
  User,
  Rocket,
  Layout,
  FileText,
  Settings,
  HelpCircle,
  MessageSquarePlus,
  LogOut,
  LogIn,
} from 'lucide-react';

interface GlobalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onOpenFeedback: () => void;
}

export function GlobalSidebar({
  isOpen,
  onClose,
  currentUser,
  onOpenFeedback,
}: GlobalSidebarProps) {
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  const handleSignOut = async () => {
    try {
      await authSignOutApiCall();
      onClose();
      window.location.href = '/';
    } catch (error) {
      console.error(error);
    }
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-70 bg-surface border-r border-outline-variant z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-outline-variant">
          <span className="font-semibold text-lg text-on-surface">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="flex flex-col min-h-full">
            <div className="space-y-2">
              <SidebarLink
                href="/"
                icon={Home}
                label="Home"
                onClick={onClose}
              />
              <SidebarLink
                href="/home"
                icon={Rocket}
                label="Dashboard"
                onClick={onClose}
              />
              <SidebarLink
                href="/design-kit"
                icon={Layout}
                label="Design Kit"
                onClick={onClose}
              />

              <div className="pt-6 pb-2 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Account
              </div>
              <SidebarLink
                href="/profile"
                icon={User}
                label="Profile"
                onClick={onClose}
              />
              <SidebarLink
                href="#"
                icon={Settings}
                label="Settings"
                onClick={onClose}
              />
              {currentUser ? (
                <SidebarLink
                  href="#"
                  icon={LogOut}
                  label="Sign out"
                  onClick={handleSignOut}
                  className="hover:text-red-500 hover:bg-red-500/10"
                  iconClassName="text-red-500"
                />
              ) : (
                <SidebarLink
                  href="/auth/sign-in"
                  icon={LogIn}
                  label="Sign in"
                  onClick={onClose}
                />
              )}
            </div>

            <div className="mt-auto space-y-2">
              <div className="pt-6 pb-2 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Support
              </div>
              <SidebarLink
                href="#"
                icon={MessageSquarePlus}
                label="Feedback & Bugs"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
              />
              <SidebarLink
                href="/docs"
                icon={FileText}
                label="Documentation"
                onClick={onClose}
              />
              <SidebarLink
                href="/help"
                icon={HelpCircle}
                label="Help Center"
                onClick={onClose}
              />
            </div>
          </nav>
        </div>

        <div className="p-6 border-t border-outline-variant">
          <div className="bg-surface-variant/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-1">Pro Plan</h4>
            <p className="text-xs text-on-surface-variant mb-3">
              Upgrade for more features
            </p>
            <button className="w-full py-2 bg-primary text-on-primary rounded text-xs font-medium hover:bg-primary/90 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

function SidebarLink({
  href,
  label,
  onClick,
  icon: Icon,
  className,
  iconClassName,
}: {
  icon: any;
  href: string;
  label: string;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-variant hover:text-primary transition-colors',
        className,
      )}
    >
      <Icon className={cn('w-5 h-5', iconClassName)} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
