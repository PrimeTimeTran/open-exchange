import React from 'react';
import { TableCell, TableRow } from 'src/shared/components/ui/table';
import { Dictionary } from 'src/translation/locales';

export default function DataTableEmptyRow({
  text,
  columns,
  dictionary,
  newButton,
}: {
  text?: string;
  columns: any[];
  dictionary: Dictionary;
  newButton?: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length}>
        <div className="flex items-center justify-center gap-8 p-8">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {text || dictionary.shared.dataTable.noResults}
            </span>

            {newButton}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
