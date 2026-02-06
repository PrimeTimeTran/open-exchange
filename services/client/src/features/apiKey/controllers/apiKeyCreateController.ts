import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  apiKeyCreateInputSchema,
  apiKeyCreateOutputSchema,
} from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import {
  allowedPermissions,
  validateHasPermission,
} from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { prismaRelationship } from 'src/prisma/prismaRelationship';
import { AppContext } from 'src/shared/controller/appContext';
import { hashSecret } from 'src/shared/lib/hashSecret';
import uniqid from 'uniqid';
import { z } from 'zod';

export const apiKeyCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/api-key',
  request: {
    body: {
      content: {
        'application/json': {
          schema: apiKeyCreateInputSchema(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: apiKeyCreateOutputSchema,
        },
      },
    },
  },
};

export async function apiKeyCreateController(
  body: unknown,
  context: AppContext,
): Promise<z.infer<typeof apiKeyCreateOutputSchema>> {
  const { currentMembership } = validateHasPermission(
    permissions.apiKeyCreate,
    context,
  );

  const availableScopes = allowedPermissions(currentMembership.roles).map(
    (r) => r.id,
  );

  const data = apiKeyCreateInputSchema(
    availableScopes,
    context.dictionary,
  ).parse(body);

  const keyPrefix = uniqid.time();
  const rawSecret = `${uniqid()}${uniqid()}`;
  const secret = await hashSecret(rawSecret);

  const prisma = prismaAuth(context);

  await prisma.apiKey.create({
    data: {
      keyPrefix,
      secret,
      expiresAt: data.expiresAt,
      name: data.name,
      scopes: data.scopes,
      membership: prismaRelationship.connectOneOrThrow(currentMembership.id),
    },
  });

  const rawKey = `${keyPrefix}.${rawSecret}`;
  return { apiKey: rawKey };
}
