import { uniqBy } from 'lodash';
import { apiKeyPermissions } from 'src/features/apiKey/apiKeyPermissions';
import { auditLogPermissions } from 'src/features/auditLog/auditLogPermissions';
import { accountPermissions } from 'src/features/account/accountPermissions';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import { orderPermissions } from 'src/features/order/orderPermissions';
import { fillPermissions } from 'src/features/fill/fillPermissions';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import { systemAccountPermissions } from 'src/features/systemAccount/systemAccountPermissions';
import { referralPermissions } from 'src/features/referral/referralPermissions';
import { listingPermissions } from 'src/features/listing/listingPermissions';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
import { marketMakerPermissions } from 'src/features/marketMaker/marketMakerPermissions';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { articlePermissions } from 'src/features/article/articlePermissions';
import { postPermissions } from 'src/features/post/postPermissions';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { chaterPermissions } from 'src/features/chater/chaterPermissions';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { notificationPermissions } from 'src/features/notification/notificationPermissions';
import { userNotificationPermissions } from 'src/features/userNotification/userNotificationPermissions';
import { jobPermissions } from 'src/features/job/jobPermissions';
import { candidatePermissions } from 'src/features/candidate/candidatePermissions';
import { membershipPermissions } from 'src/features/membership/membershipPermissions';
import { subscriptionPermissions } from 'src/features/subscription/subscriptionPermissions';
import { tenantPermissions } from 'src/features/tenant/tenantPermissions';

export interface Permission {
  id: string;
  allowedRoles: Array<string>;
  allowedStorage?: Array<string>;
}

export const permissions = {
  ...auditLogPermissions,
  ...apiKeyPermissions,
  ...membershipPermissions,
  ...subscriptionPermissions,
  ...tenantPermissions,
  ...accountPermissions,
  ...depositPermissions,
  ...withdrawalPermissions,
  ...walletPermissions,
  ...orderPermissions,
  ...fillPermissions,
  ...tradePermissions,
  ...assetPermissions,
  ...instrumentPermissions,
  ...feeSchedulePermissions,
  ...balanceSnapshotPermissions,
  ...systemAccountPermissions,
  ...referralPermissions,
  ...listingPermissions,
  ...feedbackPermissions,
  ...marketMakerPermissions,
  ...ledgerEventPermissions,
  ...ledgerEntryPermissions,
  ...articlePermissions,
  ...postPermissions,
  ...commentPermissions,
  ...chatPermissions,
  ...chaterPermissions,
  ...messagePermissions,
  ...notificationPermissions,
  ...userNotificationPermissions,
  ...jobPermissions,
  ...candidatePermissions,
} as const satisfies { [key: string]: Permission };

export function availablePermissions(roles: Array<string>) {
  return uniqBy(
    Object.values(permissions).filter((permission) => {
      return permission.allowedRoles.some((role) => roles.includes(role));
    }),
    'id',
  );
}
