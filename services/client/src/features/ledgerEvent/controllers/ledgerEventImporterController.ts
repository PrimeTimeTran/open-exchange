import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventCreate } from 'src/features/ledgerEvent/controllers/ledgerEventCreateController';
import { ledgerEventImportInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const ledgerEventImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ledger-event/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(ledgerEventImportInputSchema),
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

export async function ledgerEventImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.ledgerEventImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = ledgerEventImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.ledgerEvent.count({
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

      await ledgerEventCreate(row, context);

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
