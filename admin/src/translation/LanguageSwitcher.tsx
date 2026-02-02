'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { LuLanguages } from 'react-icons/lu';
import { authLocaleSelectApiCall } from 'src/features/auth/authApiCalls';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/shared/components/ui/popover';
import { Dictionary, Locale, locales } from 'src/translation/locales';

export default function LocaleSwitcher({
  locale,
  dictionary,
  isSidebar,
}: {
  dictionary: Dictionary;
  locale: Locale;
  isSidebar?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Locale) => {
      return authLocaleSelectApiCall(data);
    },
    onSuccess: () => {
      window.location.reload();
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {isSidebar ? (
        <PopoverTrigger asChild>
          <button
            className={cn(
              'relative flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium text-gray-500 ring-offset-background transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
            )}
            title={dictionary.shared.locales[locale]}
          >
            <LuLanguages className="mr-2 h-4 w-4" />
            <span className="truncate">
              {dictionary.shared.localeSwitcher.title}
            </span>
          </button>
        </PopoverTrigger>
      ) : (
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0 px-1">
            <LuLanguages className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput
              placeholder={dictionary.shared.localeSwitcher.searchPlaceholder}
            />
            <CommandEmpty>
              {dictionary.shared.localeSwitcher.searchEmpty}
            </CommandEmpty>
            <CommandGroup heading={dictionary.shared.localeSwitcher.title} className="max-h-[340px] overflow-y-auto">
              {locales.map((localeOption) => (
                <CommandItem
                  key={localeOption}
                  onSelect={() => {
                    mutation.mutateAsync(localeOption as Locale);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  {dictionary.shared.locales[localeOption]}
                  <FaCheck
                    className={cn(
                      'ml-auto h-4 w-4',
                      localeOption === locale ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
