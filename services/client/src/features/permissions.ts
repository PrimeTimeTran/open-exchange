import { uniqBy } from 'lodash';
import { apiKeyPermissions } from 'src/features/apiKey/apiKeyPermissions';
import { auditLogPermissions } from 'src/features/auditLog/auditLogPermissions';
import { accountPermissions } from 'src/features/account/accountPermissions';
import { walletPermissions } from 'src/features/wallet/walletPermissions';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import { orderPermissions } from 'src/features/order/orderPermissions';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import { fillPermissions } from 'src/features/fill/fillPermissions';
import { postPermissions } from 'src/features/post/postPermissions';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { articlePermissions } from 'src/features/article/articlePermissions';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import { systemAccountPermissions } from 'src/features/systemAccount/systemAccountPermissions';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
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
  ...walletPermissions,
  ...depositPermissions,
  ...withdrawalPermissions,
  ...orderPermissions,
  ...assetPermissions,
  ...instrumentPermissions,
  ...ledgerEventPermissions,
  ...ledgerEntryPermissions,
  ...tradePermissions,
  ...fillPermissions,
  ...postPermissions,
  ...commentPermissions,
  ...articlePermissions,
  ...chatPermissions,
  ...chateePermissions,
  ...messagePermissions,
  ...feeSchedulePermissions,
  ...balanceSnapshotPermissions,
  ...systemAccountPermissions,
  ...feedbackPermissions,
} as const satisfies { [key: string]: Permission };

export function availablePermissions(roles: Array<string>) {
  return uniqBy(
    Object.values(permissions).filter((permission) => {
      return permission.allowedRoles.some((role) => roles.includes(role));
    }),
    'id',
  );
}
