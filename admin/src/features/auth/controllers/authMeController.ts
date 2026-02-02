import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { validateIsSignedIn } from 'src/features/security';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { userCleanupForResponse } from 'src/features/user/userCleanupForResponse';
import { AppContext } from 'src/shared/controller/appContext';

export const authMeApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/auth/me',
  responses: {
    200: {
      description: 'User with Memberships and Tenants',
    },
  },
};

export async function authMeController(context: AppContext) {
  validateIsSignedIn(context);
  const { currentUser } = context;
  return userCleanupForResponse(currentUser as UserWithMemberships);
}
