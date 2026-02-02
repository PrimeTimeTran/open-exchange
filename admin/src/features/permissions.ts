import { uniqBy } from 'lodash';
import { apiKeyPermissions } from 'src/features/apiKey/apiKeyPermissions';
import { auditLogPermissions } from 'src/features/auditLog/auditLogPermissions';
import { postPermissions } from 'src/features/post/postPermissions';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import { orderPermissions } from 'src/features/order/orderPermissions';
import { articlePermissions } from 'src/features/article/articlePermissions';
import { itemPermissions } from 'src/features/item/itemPermissions';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import { accountPermissions } from 'src/features/account/accountPermissions';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import { tradeFillPermissions } from 'src/features/tradeFill/tradeFillPermissions';
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
  ...postPermissions,
  ...commentPermissions,
  ...orderPermissions,
  ...articlePermissions,
  ...itemPermissions,
  ...chatPermissions,
  ...chateePermissions,
  ...messagePermissions,
  ...assetPermissions,
  ...accountPermissions,
  ...instrumentPermissions,
  ...ledgerEventPermissions,
  ...ledgerEntryPermissions,
  ...tradePermissions,
  ...tradeFillPermissions,
} as const satisfies { [key: string]: Permission };

export function availablePermissions(roles: Array<string>) {
  return uniqBy(
    Object.values(permissions).filter((permission) => {
      return permission.allowedRoles.some((role) => roles.includes(role));
    }),
    'id',
  );
}
