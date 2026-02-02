'use client';

import { times } from 'lodash';
import Link from 'src/shared/components/Link';
import { usePathname } from 'next/navigation';
import { menus } from 'src/features/menus';
import { cn } from 'src/shared/components/cn';
import { AppContext } from 'src/shared/controller/appContext';
import { LuPlus } from 'react-icons/lu';
import { Button } from 'src/shared/components/ui/button';

export function AuthenticatedMenu({
  context,
  onMenuClick,
}: {
  context: AppContext;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full flex-1 overflow-y-auto">
      <div className="flex max-h-[80vh] w-full flex-col gap-1">
        {menus(context).map((menu) => (
          <div key={menu.id} className="relative flex items-center">
            <Link
              href={menu.href}
              className={cn(
                isActive(menu.href, pathname, menu.isExact)
                  ? 'bg-gray-200 text-gray-800 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700'
                  : 'text-gray-500 hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
                'flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium',
              )}
              onClick={onMenuClick}
              prefetch={false}
            >
              <menu.Icon className="mr-2 h-4 w-4" />
              {menu.label}
            </Link>
            {menu.createHref ? (
              <Button
                asChild
                variant={'ghost'}
                className={cn(
                  'absolute right-0 z-10 h-9 bg-transparent',
                  isActive(menu.href, pathname, menu.isExact)
                    ? 'hover:bg-transparent'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                )}
              >
                <Link
                  title={context.dictionary.shared.new}
                  href={menu.createHref}
                  onClick={onMenuClick}
                  prefetch={false}
                >
                  <LuPlus className="h-3 w-3 font-bold" />
                </Link>
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function isActive(path: string, currentPath: string, isExact?: boolean) {
  if (isExact) {
    return currentPath === path;
  }

  return currentPath === path || currentPath.startsWith(path + '/');
}
