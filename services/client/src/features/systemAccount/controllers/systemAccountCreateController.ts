import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { systemAccountCreateInputSchema } from 'src/features/systemAccount/systemAccountSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const systemAccountCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/system-account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: systemAccountCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'SystemAccount',
    },
  },
};

export async function systemAccountCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.systemAccountCreate, context);
  return await systemAccountCreate(body, context);
}

export async function systemAccountCreate(body: unknown, context: AppContext) {
  const data = systemAccountCreateInputSchema.parse(body);
  const prisma = prismaAuth(context);
  // let systemAccount = await prisma.systemAccount.create({
  //   data: {
  //     account: {
  //       create: {
  //         type: 'system',
  //         name: data.name,
  //         status: 'active',
  //       },
  //     },
  //     type: data.type,
  //     name: data.name,
  //     description: data.description,
  //     isActive: data.isActive,
  //     meta: data.meta,
  //     importHash: data.importHash,
  //   },
  //   include: {
  //     createdByMembership: true,
  //     updatedByMembership: true,
  //     archivedByMembership: true,
  //   },
  // });

  // systemAccount = await filePopulateDownloadUrlInTree(systemAccount);

  return null;
}
