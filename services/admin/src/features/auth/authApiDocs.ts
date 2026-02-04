import { OpenAPIRegistry, RouteConfig } from '@asteasolutions/zod-to-openapi';
import { authMeApiDoc } from 'src/features/auth/controllers/authMeController';
import { authOauthApiDoc } from 'src/features/auth/controllers/authOauthController';
import { authPasswordChangeApiDoc } from 'src/features/auth/controllers/authPasswordChangeController';
import { authPasswordResetConfirmApiDoc } from 'src/features/auth/controllers/authPasswordResetConfirmController';
import { authPasswordResetRequestApiDoc } from 'src/features/auth/controllers/authPasswordResetRequestController';
import { authSignInApiDoc } from 'src/features/auth/controllers/authSignInController';
import { authSignUpApiDoc } from 'src/features/auth/controllers/authSignUpController';
import { authVerifyEmailConfirmApiDoc } from 'src/features/auth/controllers/authVerifyEmailConfirmController';
import { authVerifyEmailRequestApiDoc } from 'src/features/auth/controllers/authVerifyEmailRequestController';

export function authApiDocs(registry: OpenAPIRegistry, security: any) {
  const authTenantSelect: RouteConfig = {
    method: 'post',
    path: '/api/auth/tenant/:id',
    responses: {
      200: {
        description: 'OK',
      },
    },
  };

  [
    authTenantSelect,
    authMeApiDoc,
    authPasswordChangeApiDoc,
    authVerifyEmailRequestApiDoc,
  ].map((apiDocWithSecurity) => {
    registry.registerPath({
      ...apiDocWithSecurity,
      tags: ['Auth'],
      security,
    });
  });

  [
    authPasswordResetConfirmApiDoc,
    authPasswordResetRequestApiDoc,
    authSignInApiDoc,
    authSignUpApiDoc,
    authVerifyEmailConfirmApiDoc,
    authOauthApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Auth'],
    });
  });
}
