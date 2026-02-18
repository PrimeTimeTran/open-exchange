'use client';

import React, { useState } from 'react';
import { Key, Bell, User, Shield, Settings, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Tab =
  | 'general'
  | 'security'
  | 'api-keys'
  | 'preferences'
  | 'notifications'
  | 'billing';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <SidebarItem
              icon={User}
              label="General"
              isActive={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            />
            <SidebarItem
              icon={Shield}
              label="Security"
              isActive={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
            <SidebarItem
              icon={Key}
              label="API Keys"
              isActive={activeTab === 'api-keys'}
              onClick={() => setActiveTab('api-keys')}
            />
            <SidebarItem
              icon={Bell}
              label="Notifications"
              isActive={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
            <SidebarItem
              icon={Settings}
              label="Preferences"
              isActive={activeTab === 'preferences'}
              onClick={() => setActiveTab('preferences')}
            />{' '}
            <SidebarItem
              icon={CreditCard}
              label="Billing"
              isActive={activeTab === 'billing'}
              onClick={() => setActiveTab('billing')}
            />{' '}
          </nav>
        </aside>

        <div className="flex-1 lg:max-w-2xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                  This is how others will see you on the site.
                </p>
              </div>
              <div className="border-t pt-6"></div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    defaultValue="crypto_trader_01"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    This is your public display name.
                  </p>
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    defaultValue="user@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="bio"
                  >
                    Bio
                  </label>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="bio"
                    placeholder="Tell us a little bit about yourself"
                  />
                </div>

                <div className="flex justify-end">
                  <Button>Save changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your password and 2FA settings.
                </p>
              </div>
              <div className="border-t pt-6"></div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      Two-factor Authentication
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Password</label>
                    <p className="text-sm text-muted-foreground">
                      Change your password regularly to keep your account
                      secure.
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your API keys for external access.
                </p>
              </div>
              <div className="border-t pt-6"></div>

              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Read-only Key</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        pk_live_...1234
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Key className="mr-2 h-4 w-4" /> Generate New Key
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive notifications.
                </p>
              </div>
              <div className="border-t pt-6"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      Email Notifications
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your account activity.
                    </p>
                  </div>
                  {/* Placeholder for switch */}
                  <div className="h-6 w-11 rounded-full bg-primary/20"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your experience.
                </p>
              </div>
              <div className="border-t pt-6"></div>
              <p className="text-sm text-muted-foreground">
                Theme settings coming soon.
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your billing information and payment methods.
                </p>
              </div>
              <div className="border-t pt-6"></div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">
                    Payment Methods
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Add or remove payment methods.
                  </p>
                </div>
                <Button variant="outline">Add Card</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
