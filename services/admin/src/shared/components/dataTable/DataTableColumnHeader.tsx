import { Column } from '@tanstack/react-table';
import { RxArrowDown, RxArrowUp, RxCaretSort, RxEyeNone } from 'react-icons/rx';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { Dictionary } from 'src/translation/locales';

export const DataTableColumnIds = {
  select: 'select',
  actions: 'actions',
} as const;

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  dictionary: Dictionary;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  className,
  dictionary,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // @ts-ignore
  const title = column.columnDef.meta?.title;

  if (!column.getCanSort()) {
    return <div className={cn('whitespace-nowrap', className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="whitespace-nowrap">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <RxArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <RxArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <RxCaretSort className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <RxArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {dictionary.shared.dataTable.sortAscending}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <RxArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {dictionary.shared.dataTable.sortDescending}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <RxEyeNone className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {dictionary.shared.dataTable.hide}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
