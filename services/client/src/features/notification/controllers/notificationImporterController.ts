import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationCreate } from 'src/features/notification/controllers/notificationCreateController';
import { notificationImportInputSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const notificationImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/notification/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(notificationImportInputSchema),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: importerOutputSchema,
        },
      },
    },
  },
};

export async function notificationImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.notificationImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = notificationImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.notification.count({
          where: {
            importHash: data.importHash,
          },
        }),
      );

      if (isImportHashExistent) {
        throw new Error400(
          context.dictionary.shared.importer.importHashAlreadyExists,
        );
      }

      await notificationCreate(row, context);

      output.push({
        _status: 'success',
        _line: (row as any)._line,
      });
    } catch (error: any) {
      output.push({
        _status: 'error',
        _line: (row as any)._line,
        _errorMessages: [error.message],
      });
    }
  }

  return output;
}
