import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { apiKeyApiDocs } from 'src/features/apiKey/apiKeyApiDocs';
import { auditLogApiDocs } from 'src/features/auditLog/auditLogApiDocs';
import { authApiDocs } from 'src/features/auth/authApiDocs';
import { accountApiDocs } from 'src/features/account/accountApiDocs';
import { depositApiDocs } from 'src/features/deposit/depositApiDocs';
import { withdrawalApiDocs } from 'src/features/withdrawal/withdrawalApiDocs';
import { walletApiDocs } from 'src/features/wallet/walletApiDocs';
import { orderApiDocs } from 'src/features/order/orderApiDocs';
import { fillApiDocs } from 'src/features/fill/fillApiDocs';
import { tradeApiDocs } from 'src/features/trade/tradeApiDocs';
import { assetApiDocs } from 'src/features/asset/assetApiDocs';
import { instrumentApiDocs } from 'src/features/instrument/instrumentApiDocs';
import { feeScheduleApiDocs } from 'src/features/feeSchedule/feeScheduleApiDocs';
import { balanceSnapshotApiDocs } from 'src/features/balanceSnapshot/balanceSnapshotApiDocs';
import { systemAccountApiDocs } from 'src/features/systemAccount/systemAccountApiDocs';
import { referralApiDocs } from 'src/features/referral/referralApiDocs';
import { listingApiDocs } from 'src/features/listing/listingApiDocs';
import { feedbackApiDocs } from 'src/features/feedback/feedbackApiDocs';
import { marketMakerApiDocs } from 'src/features/marketMaker/marketMakerApiDocs';
import { ledgerEventApiDocs } from 'src/features/ledgerEvent/ledgerEventApiDocs';
import { ledgerEntryApiDocs } from 'src/features/ledgerEntry/ledgerEntryApiDocs';
import { articleApiDocs } from 'src/features/article/articleApiDocs';
import { postApiDocs } from 'src/features/post/postApiDocs';
import { commentApiDocs } from 'src/features/comment/commentApiDocs';
import { chatApiDocs } from 'src/features/chat/chatApiDocs';
import { chaterApiDocs } from 'src/features/chater/chaterApiDocs';
import { messageApiDocs } from 'src/features/message/messageApiDocs';
import { notificationApiDocs } from 'src/features/notification/notificationApiDocs';
import { userNotificationApiDocs } from 'src/features/userNotification/userNotificationApiDocs';
import { jobApiDocs } from 'src/features/job/jobApiDocs';
import { candidateApiDocs } from 'src/features/candidate/candidateApiDocs';
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
accountApiDocs(registry, security);
depositApiDocs(registry, security);
withdrawalApiDocs(registry, security);
walletApiDocs(registry, security);
orderApiDocs(registry, security);
fillApiDocs(registry, security);
tradeApiDocs(registry, security);
assetApiDocs(registry, security);
instrumentApiDocs(registry, security);
feeScheduleApiDocs(registry, security);
balanceSnapshotApiDocs(registry, security);
systemAccountApiDocs(registry, security);
referralApiDocs(registry, security);
listingApiDocs(registry, security);
feedbackApiDocs(registry, security);
marketMakerApiDocs(registry, security);
ledgerEventApiDocs(registry, security);
ledgerEntryApiDocs(registry, security);
articleApiDocs(registry, security);
postApiDocs(registry, security);
commentApiDocs(registry, security);
chatApiDocs(registry, security);
chaterApiDocs(registry, security);
messageApiDocs(registry, security);
notificationApiDocs(registry, security);
userNotificationApiDocs(registry, security);
jobApiDocs(registry, security);
candidateApiDocs(registry, security);
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
