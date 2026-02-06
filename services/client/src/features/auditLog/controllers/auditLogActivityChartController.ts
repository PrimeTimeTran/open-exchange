import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  auditLogActivityChartInputSchema,
  auditLogActivityChartOutputSchema,
} from 'src/features/auditLog/auditLogSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

dayjs.extend(utc);
dayjs.extend(timezone);

export const auditLogActivityChartApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/audit-log/activity-chart',
  request: {
    query: auditLogActivityChartInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: auditLogActivityChartOutputSchema,
        },
      },
    },
  },
};

export async function auditLogActivityChartController(
  query: any,
  context: AppContext,
): Promise<z.infer<typeof auditLogActivityChartOutputSchema>> {
  const { timezone } = auditLogActivityChartInputSchema.parse(query);

  const { currentTenant } = validateHasPermission(
    permissions.auditLogRead,
    context,
  );
  const prisma = prismaAuth(context);

  const oneWeekAgo = dayjs()
    .tz(timezone)
    .startOf('day')
    .subtract(1, 'week')
    .toDate();

  const rows: Array<any> = await prisma.$queryRaw`
    SELECT date_trunc('day', "timestamp" AT TIME ZONE '${timezone}') as "timestamp", count(1) from "AuditLog" where "tenantId"::text = ${currentTenant.id} and "timestamp" > ${oneWeekAgo} group by 1 order by "timestamp" desc;
  `;

  return rows.map((row) => {
    return {
      timestamp: row.timestamp.toISOString().split('T')[0],
      count: row.count,
    };
  });
}
