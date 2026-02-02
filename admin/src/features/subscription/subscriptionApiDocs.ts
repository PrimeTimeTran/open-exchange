import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { subscriptionCheckoutApiDoc } from 'src/features/subscription/controllers/subscriptionCheckoutController';
import { subscriptionPortalApiDoc } from 'src/features/subscription/controllers/subscriptionPortalController';
import { subscriptionWebhookApiDoc } from 'src/features/subscription/controllers/subscriptionWebhookController';

export function subscriptionApiDocs(registry: OpenAPIRegistry, security: any) {
  [subscriptionPortalApiDoc, subscriptionCheckoutApiDoc].map(
    (apiDocWithSecurity) => {
      registry.registerPath({
        ...apiDocWithSecurity,
        tags: ['Subscription'],
        security,
      });
    },
  );

  [subscriptionWebhookApiDoc].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Subscription'],
    });
  });
}
