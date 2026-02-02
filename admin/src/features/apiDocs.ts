import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { apiKeyApiDocs } from 'src/features/apiKey/apiKeyApiDocs';
import { auditLogApiDocs } from 'src/features/auditLog/auditLogApiDocs';
import { authApiDocs } from 'src/features/auth/authApiDocs';
import { postApiDocs } from 'src/features/post/postApiDocs';
import { commentApiDocs } from 'src/features/comment/commentApiDocs';
import { orderApiDocs } from 'src/features/order/orderApiDocs';
import { articleApiDocs } from 'src/features/article/articleApiDocs';
import { itemApiDocs } from 'src/features/item/itemApiDocs';
import { chatApiDocs } from 'src/features/chat/chatApiDocs';
import { chateeApiDocs } from 'src/features/chatee/chateeApiDocs';
import { messageApiDocs } from 'src/features/message/messageApiDocs';
import { assetApiDocs } from 'src/features/asset/assetApiDocs';
import { accountApiDocs } from 'src/features/account/accountApiDocs';
import { instrumentApiDocs } from 'src/features/instrument/instrumentApiDocs';
import { ledgerEventApiDocs } from 'src/features/ledgerEvent/ledgerEventApiDocs';
import { ledgerEntryApiDocs } from 'src/features/ledgerEntry/ledgerEntryApiDocs';
import { tradeApiDocs } from 'src/features/trade/tradeApiDocs';
import { tradeFillApiDocs } from 'src/features/tradeFill/tradeFillApiDocs';
import { fileApiDocs } from 'src/features/file/fileApiDocs';
import { membershipApiDocs } from 'src/features/membership/membershipApiDocs';
import { subscriptionApiDocs } from 'src/features/subscription/subscriptionApiDocs';
import { tenantApiDocs } from 'src/features/tenant/tenantApiDocs';

const registry = new OpenAPIRegistry();

const apiKey = registry.registerComponent('securitySchemes', 'API Key', {
  type: 'http',
  scheme: 'bearer',
});

const security = [{ [apiKey.name]: [] }];

authApiDocs(registry, security);
apiKeyApiDocs(registry, security);
auditLogApiDocs(registry, security);
postApiDocs(registry, security);
commentApiDocs(registry, security);
orderApiDocs(registry, security);
articleApiDocs(registry, security);
itemApiDocs(registry, security);
chatApiDocs(registry, security);
chateeApiDocs(registry, security);
messageApiDocs(registry, security);
assetApiDocs(registry, security);
accountApiDocs(registry, security);
instrumentApiDocs(registry, security);
ledgerEventApiDocs(registry, security);
ledgerEntryApiDocs(registry, security);
tradeApiDocs(registry, security);
tradeFillApiDocs(registry, security);
membershipApiDocs(registry, security);
tenantApiDocs(registry, security);
subscriptionApiDocs(registry, security);
fileApiDocs(registry, security);

export function buildApiDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'API',
    },
    openapi: '3.0.0',
  });
}
