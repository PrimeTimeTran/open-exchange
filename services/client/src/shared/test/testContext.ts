import {
  authenticateWithApiKey,
  authenticateWithJwtToken,
} from 'src/features/auth/authMiddleware';
import { jwtSign } from 'src/shared/lib/jwt';
import { dictionaryMiddleware } from 'src/translation/dictionaryMiddleware';

export async function testContext(options?: {
  currentUserId?: string;
  currentTenantId?: string;
  apiKey?: string;
  locale?: string;
}) {
  const context = await dictionaryMiddleware(options?.locale, {});

  if (options?.apiKey) {
    return await authenticateWithApiKey(options.apiKey, context);
  }

  if (options?.currentUserId) {
    return await authenticateWithJwtToken(
      jwtSign({ id: options?.currentUserId }),
      options?.currentTenantId,
      context,
    );
  }

  return context;
}
