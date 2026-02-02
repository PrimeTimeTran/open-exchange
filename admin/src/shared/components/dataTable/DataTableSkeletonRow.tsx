import { times } from 'lodash';
import { Skeleton } from 'src/shared/components/ui/skeleton';
import { TableCell, TableRow } from 'src/shared/components/ui/table';

export default function DataTableSkeletonRow({
  count,
  columns,
}: {
  count?: number;
  columns: any[];
}) {
  return (
    <>
      {times(count || 5).map((index) => (
        <TableRow key={index}>
          {columns.map((column, index) => (
            <TableCell key={column.id || index}>
              {column.id !== 'select' ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                ''
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
