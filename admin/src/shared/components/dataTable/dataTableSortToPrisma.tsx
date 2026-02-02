import { SortingState } from '@tanstack/react-table';

export function dataTableSortToPrisma(sorting: SortingState) {
  const orderBy: { [key: string]: 'asc' | 'desc' } = {};

  sorting.forEach((sort) => {
    orderBy[sort.id] = sort.desc ? 'desc' : 'asc';
  });

  if (Object.keys(orderBy).length === 0) {
    return undefined;
  }

  return orderBy;
}
