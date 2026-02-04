import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletCreate } from 'src/features/wallet/controllers/walletCreateController';
import { walletImportInputSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const walletImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/wallet/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(walletImportInputSchema),
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

export async function walletImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.walletImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = walletImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.wallet.count({
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

      await walletCreate(row, context);

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
