import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { LuChevronsUpDown, LuLoader2, LuX } from 'react-icons/lu';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from 'src/shared/components/ui/command';
import { FormControl } from 'src/shared/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/shared/components/ui/popover';
import { useDebounce } from 'src/shared/hooks/useDebounce';
import { Dictionary } from 'src/translation/locales';

export default function AutocompleteAsyncInput<T extends { id: string }>({
  queryId,
  onChange,
  value,
  dictionary,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  isClearable,
  queryFn,
  labelFn,
  exclude,
  disabled,
  dataTestid,
}: {
  queryId: string[];
  onChange: (value: Partial<T> | undefined | null) => void;
  value?: Partial<T> | null;
  dictionary: Dictionary;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  isClearable?: boolean;
  queryFn: (
    query?: string,
    exclude?: Array<string>,
    signal?: AbortSignal,
  ) => Promise<any>;
  labelFn: (value?: Partial<T> | null, dictionary?: Dictionary) => string;
  exclude?: Array<Partial<T>> | null;
  disabled?: boolean;
  dataTestid?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const searchDebounced = useDebounce(search, 1000);

  const excludedIds = [
    ...(exclude?.map((item) => item?.id!) || []),
    value?.id,
  ].filter(Boolean);

  const query = useQuery({
    queryKey: [...queryId, excludedIds, searchDebounced],
    queryFn: ({ signal }) => queryFn(searchDebounced, excludedIds, signal),
  });

  function onSelect(id?: string | null) {
    setOpen(false);

    if (!id) {
      onChange(null);
    }

    const option = query.data?.find((option: T) => option.id === id);
    onChange(option);
  }

  const isLoading =
    query.isFetching || query.isLoading || search !== searchDebounced;

  return (
    <div className="flex items-center gap-1" data-testid={dataTestid}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                'w-full justify-between',
                !value && 'text-muted-foreground',
              )}
              disabled={disabled}
            >
              {labelFn(value, dictionary) ||
                selectPlaceholder ||
                dictionary.shared.selectPlaceholder}
              <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          <Command filter={() => 1}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={
                searchPlaceholder || dictionary.shared.searchPlaceholder
              }
              disabled={disabled}
            />

            {isLoading && (
              <div className="flex items-center justify-center py-6 text-sm">
                <LuLoader2 className="h-5 w-5 animate-spin text-muted" />
              </div>
            )}

            {!isLoading && !query?.data?.length && (
              <div className="py-6 text-center text-sm">
                {notFoundPlaceholder || dictionary.shared.searchNotFound}
              </div>
            )}

            <CommandGroup className="max-h-[340px] overflow-y-auto">
              {!isLoading &&
                query.isSuccess &&
                query?.data?.map((option: T) => (
                  <CommandItem
                    value={option.id}
                    key={option.id}
                    onSelect={onSelect}
                    aria-label={labelFn(option, dictionary)}
                    data-testid={
                      dataTestid
                        ? `${dataTestid}-option-${option.id}`
                        : undefined
                    }
                  >
                    <FaCheck
                      className={cn(
                        'mr-2 h-4 w-4',
                        option.id === value?.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {labelFn(option, dictionary)}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {isClearable && value && (
        <Button
          type="button"
          variant="secondary"
          size={'icon'}
          onClick={() => onChange(null)}
          title={dictionary.shared.clear}
          disabled={disabled}
        >
          <LuX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
