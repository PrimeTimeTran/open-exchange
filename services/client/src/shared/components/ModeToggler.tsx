'use client';

import { useTheme } from 'next-themes';
import { LuLaptop, LuMoon, LuSunMedium } from 'react-icons/lu';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { Dictionary } from 'src/translation/locales';

export function ModeToggle({
  dictionary,
  isSidebar,
}: {
  isSidebar?: boolean;
  dictionary: Dictionary;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {isSidebar ? (
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'relative flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium text-gray-500 ring-offset-background transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
            )}
          >
            <LuSunMedium className="mr-2 h-4 w-4 dark:hidden" />
            <LuMoon className="mr-2 hidden h-4 w-4 dark:inline" />
            <span>{dictionary.shared.theme.toggle}</span>
          </button>
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0 px-1">
            <LuSunMedium className="h-4 w-4 text-muted-foreground dark:hidden" />
            <LuMoon className="hidden h-4 w-4 text-muted-foreground dark:inline" />
            <span className="sr-only">{dictionary.shared.theme.toggle}</span>
          </Button>
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <LuSunMedium className="mr-2 h-4 w-4" />
          <span>{dictionary.shared.theme.light}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <LuMoon className="mr-2 h-4 w-4" />
          <span>{dictionary.shared.theme.dark}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <LuLaptop className="mr-2 h-4 w-4" />
          <span>{dictionary.shared.theme.system}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
