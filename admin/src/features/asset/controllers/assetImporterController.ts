import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetCreate } from 'src/features/asset/controllers/assetCreateController';
import { assetImportInputSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const assetImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/asset/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(assetImportInputSchema),
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

export async function assetImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.assetImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = assetImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.asset.count({
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

      await assetCreate(row, context);

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
