import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeCreate } from 'src/features/chatee/controllers/chateeCreateController';
import { chateeImportInputSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { z } from 'zod';

export const chateeImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chatee/importer',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.array(chateeImportInputSchema),
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

export async function chateeImporterController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.chateeImport, context);
  const prisma = await prismaAuth(context);

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.infer<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = chateeImportInputSchema.parse(row);

      const isImportHashExistent = Boolean(
        await prisma.chatee.count({
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

      await chateeCreate(row, context);

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
