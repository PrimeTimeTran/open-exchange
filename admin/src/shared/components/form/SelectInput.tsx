import { toLower } from 'lodash';
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { LuChevronsUpDown, LuX } from 'react-icons/lu';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
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
import { Dictionary } from 'src/translation/locales';

export default function SelectInput({
  onChange,
  value,
  dictionary,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  options,
  isClearable,
  disabled,
  dataTestid,
}: {
  onChange: (value: string | undefined | null) => void;
  value?: string | null;
  dictionary: Dictionary;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  options: Array<{ value: string; label: string }>;
  isClearable?: boolean;
  disabled?: boolean;
  dataTestid?: string;
}) {
  const [open, setOpen] = useState(false);

  function onChangeInternal(value: string | undefined | null) {
    // Fix: For some reason the value sometimes is in lower case. This snippet fixes that.
    const correctValue =
      options.find((option) => option.value === value || '')?.value ||
      options.find((option) => toLower(option.value) === toLower(value || ''))
        ?.value ||
      value;
    setOpen(false);
    onChange(correctValue);
  }

  const commandFilter = (value: string, search: string) => {
    let option = options.find((option) => option.value === value);

    if (!option) {
      option = options.find(
        (option) => toLower(option.value) === toLower(value),
      );
    }

    if (toLower(option?.label).includes(toLower(search))) {
      return 1;
    }
    return 0;
  };

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
              {value
                ? options.find((option) => option.value === value)?.label
                : selectPlaceholder || dictionary.shared.selectPlaceholder}
              <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[340px] p-0">
          <Command filter={commandFilter}>
            <CommandInput
              placeholder={
                searchPlaceholder || dictionary.shared.searchPlaceholder
              }
            />
            <CommandEmpty>
              {notFoundPlaceholder || dictionary.shared.searchNotFound}
            </CommandEmpty>
            <CommandGroup className="max-h-[340px] overflow-y-auto">
              {options.map((option) => {
                return (
                  <CommandItem
                    value={option.value}
                    key={option.value}
                    onSelect={onChangeInternal}
                    data-testid={
                      dataTestid
                        ? `${dataTestid}-option-${option.value}`
                        : undefined
                    }
                  >
                    <FaCheck
                      className={cn(
                        'mr-2 h-4 w-4',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
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
