import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralCreate } from 'src/features/referral/controllers/referralCreateController';
import { referralImportInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const referralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/referral/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(referralImportInputSchema),
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

export async function referralImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.referralImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = referralImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.referral.count({
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

      await referralCreate(row, context);

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
