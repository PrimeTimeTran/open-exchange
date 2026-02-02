/* eslint-disable react/display-name */
import { HeaderContext } from '@tanstack/react-table';
import React from 'react';
import { DataTableColumnHeader } from 'src/shared/components/dataTable/DataTableColumnHeader';
import { Dictionary } from 'src/translation/locales';

export function dataTableHeader(
  align: 'left' | 'center' | 'right',
  dictionary: Dictionary,
) {
  return ({ column }: HeaderContext<any, any>) => (
    <div
      className={
        align === 'right'
          ? 'flex justify-end'
          : align === 'center'
          ? 'flex justify-center'
          : ''
      }
    >
      <DataTableColumnHeader column={column} dictionary={dictionary} />
    </div>
  );
}
