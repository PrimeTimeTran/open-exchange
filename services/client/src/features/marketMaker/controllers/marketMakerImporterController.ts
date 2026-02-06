import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerCreate } from 'src/features/marketMaker/controllers/marketMakerCreateController';
import { marketMakerImportInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const marketMakerImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/market-maker/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(marketMakerImportInputSchema),
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

export async function marketMakerImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.marketMakerImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = marketMakerImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.marketMaker.count({
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

      await marketMakerCreate(row, context);

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
