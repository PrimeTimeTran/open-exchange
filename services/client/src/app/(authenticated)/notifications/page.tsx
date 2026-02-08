import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <Bell className="text-muted-foreground h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">
        No notifications yet
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        We will let you know when something important happens.
      </p>
    </div>
  );
}
