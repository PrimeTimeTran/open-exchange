import {
  ColumnDef,
  Table as ReactTable,
  flexRender,
} from '@tanstack/react-table';
import { cn } from 'src/shared/components/cn';
import DataTableEmptyRow from 'src/shared/components/dataTable/DataTableEmptyRow';
import DataTableSkeletonRow from 'src/shared/components/dataTable/DataTableSkeletonRow';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/shared/components/ui/table';
import { Dictionary } from 'src/translation/locales';

export default function DataTable({
  table,
  notFoundText,
  newButton,
  columns,
  isLoading,
  dictionary,
}: {
  table: ReactTable<any>;
  columns: ColumnDef<any>[];
  isLoading?: boolean;
  notFoundText?: string;
  newButton?: React.ReactNode;
  dictionary: Dictionary;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={'group hover:bg-muted-half'}
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      (header?.column?.columnDef?.meta as any)?.sticky
                        ? `sticky right-0 w-0 bg-background transition-colors group-hover:bg-muted-half`
                        : '',
                      '[&:has([role=checkbox])]:w-12',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={'group hover:bg-muted-half'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      (cell?.column?.columnDef?.meta as any)?.sticky
                        ? `sticky right-0 w-0 bg-background transition-colors group-hover:bg-muted-half ${
                            row.getIsSelected() && 'bg-muted'
                          }`
                        : ''
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isLoading ? (
            <DataTableSkeletonRow columns={columns} />
          ) : (
            <DataTableEmptyRow
              text={notFoundText}
              newButton={newButton}
              columns={columns}
              dictionary={dictionary}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
