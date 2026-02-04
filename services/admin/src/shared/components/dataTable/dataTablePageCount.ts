import { PaginationState } from '@tanstack/react-table';

export function dataTablePageCount(
  totalCount?: number,
  pagination?: PaginationState,
) {
  return Math.ceil((totalCount || 0) / (pagination?.pageSize || 10));
}
