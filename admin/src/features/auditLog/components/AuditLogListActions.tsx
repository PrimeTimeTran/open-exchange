'use client';

import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { FaRegFileExcel } from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { auditLogFindManyApiCall } from 'src/features/auditLog/auditLogApiCalls';
import { auditLogExporterMapper } from 'src/features/auditLog/auditLogExporterMapper';
import { auditLogFilterInputSchema } from 'src/features/auditLog/auditLogSchemas';
import { DataTableSort } from 'src/shared/components/dataTable/dataTableSchemas';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import { Button } from 'src/shared/components/ui/button';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { csvExporter } from 'src/shared/lib/csvExporter';
import { z } from 'zod';

export default function AuditLogListActions({
  context,
  table,
  count,
  filter,
  sorting,
}: {
  filter: z.input<typeof auditLogFilterInputSchema>;
  sorting: DataTableSort;
  count?: number;
  context: AppContext;
  table: Table<AuditLogWithAuthor>;
}) {
  const { dictionary } = context;

  const exportMutation = useMutation({
    mutationFn: () => {
      return auditLogFindManyApiCall({
        filter: filter,
        orderBy: dataTableSortToPrisma(sorting),
      });
    },
    onSuccess: (data) => {
      csvExporter(
        auditLogExporterMapper(data.auditLogs, context),
        dictionary.auditLog.fields,
        'auditLogs',
      );
      toast({
        description: dictionary.auditLog.export.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const isLoading = exportMutation.isPending;

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto flex h-8"
      onClick={() => exportMutation.mutateAsync()}
      disabled={!count || exportMutation.isPending}
    >
      {isLoading ? (
        <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FaRegFileExcel className="mr-2 h-4 w-4" />
      )}
      <span className="whitespace-nowrap">{dictionary.shared.exportToCsv}</span>
    </Button>
  );
}
