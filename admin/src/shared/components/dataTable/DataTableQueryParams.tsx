import { PaginationState, SortingState, Updater } from '@tanstack/react-table';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { dataTableDefaults } from 'src/shared/components/dataTable/dataTableDefaults';
import { dataTableSortSchema } from 'src/shared/components/dataTable/dataTableSchemas';
import { objectRemoveEmptyNullAndUndefined } from 'src/shared/lib/objectRemoveEmptyNullAndUndefined';
import { objectToQuery } from 'src/shared/lib/objectToQuery';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { ZodSchema, z } from 'zod';

export class DataTableQueryParams {
  static getFilter<T>(
    searchParams: ReadonlyURLSearchParams,
    schema: ZodSchema,
  ): T {
    const filter: any = queryToObject(searchParams.toString()).filter || {};
    return schema.parse(filter);
  }

  static onFilterChange(
    filter: object,
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
  ) {
    router.push(
      `?${objectToQuery({
        ...queryToObject(searchParams.toString()),
        filter: objectRemoveEmptyNullAndUndefined(filter),
      })}`,
    );
  }

  static getSorting(searchParams: ReadonlyURLSearchParams) {
    const sortingState: any =
      queryToObject(searchParams.toString()).sorting || [];
    return dataTableSortSchema.parse(sortingState);
  }

  static onSortingChange(
    old: SortingState,
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
  ) {
    return (updater: Updater<SortingState>) => {
      if (typeof updater === 'function') {
        const sorting = updater(old);

        router.push(
          `?${objectToQuery({
            ...queryToObject(searchParams.toString()),
            sorting,
          })}`,
        );
      }
    };
  }

  static getPagination(searchParams: ReadonlyURLSearchParams) {
    const paginationState: any = queryToObject(searchParams.toString())
      .pagination || {
      pageIndex: 0,
      pageSize: dataTableDefaults.pageSize,
    };

    return z
      .object({
        pageIndex: z.coerce.number(),
        pageSize: z.coerce.number(),
      })
      .parse(paginationState);
  }

  static onPaginationChange(
    old: PaginationState,
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
  ) {
    return (updater: Updater<PaginationState>) => {
      if (typeof updater === 'function') {
        const pagination = updater(old);

        router.push(
          `?${objectToQuery({
            ...queryToObject(searchParams.toString()),
            pagination,
          })}`,
        );
      }
    };
  }
}
