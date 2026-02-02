'use client';

import { ApiKey } from '@prisma/client';
import { Table } from '@tanstack/react-table';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { apiKeyFilterInputSchema } from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { DataTableSort } from 'src/shared/components/dataTable/dataTableSchemas';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export default function ApiKeyListActions({
  context,
  table,
  count,
  filter,
  sorting,
}: {
  filter: z.input<typeof apiKeyFilterInputSchema>;
  sorting: DataTableSort;
  count?: number;
  context: AppContext;
  table: Table<ApiKey>;
}) {
  const { dictionary } = context;

  const hasPermissionToCreate = hasPermission(
    permissions.apiKeyCreate,
    context,
  );

  if (!hasPermissionToCreate) {
    return null;
  }

  return (
    <Button size="sm" className="ml-auto flex h-8" asChild>
      <Link href={`/api-key/new`} prefetch={false}>
        <FaPlus className="mr-2 h-4 w-4" />
        {dictionary.shared.new}
      </Link>
    </Button>
  );
}
