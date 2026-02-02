// @ts-ignore
const path = require('path');
// @ts-ignore
const fs = require('fs');

// @ts-ignore
const triggers = [
  'src/features/auditLog/auditLogTriggers.sql',
  'src/features/post/postTriggers.sql',
  'src/features/comment/commentTriggers.sql',
  'src/features/order/orderTriggers.sql',
  'src/features/article/articleTriggers.sql',
  'src/features/item/itemTriggers.sql',
  'src/features/chat/chatTriggers.sql',
  'src/features/chatee/chateeTriggers.sql',
  'src/features/message/messageTriggers.sql',
  'src/features/asset/assetTriggers.sql',
  'src/features/account/accountTriggers.sql',
  'src/features/instrument/instrumentTriggers.sql',
  'src/features/ledgerEvent/ledgerEventTriggers.sql',
  'src/features/ledgerEntry/ledgerEntryTriggers.sql',
  'src/features/trade/tradeTriggers.sql',
  'src/features/tradeFill/tradeFillTriggers.sql',
  'src/features/apiKey/apiKeyTriggers.sql',
  'src/features/membership/membershipTriggers.sql',
  'src/features/subscription/subscriptionTriggers.sql',
  'src/features/tenant/tenantTriggers.sql',
  'src/features/user/userTriggers.sql',
]
  .map((triggerSqlPath) => {
    return fs
      .readFileSync(path.join(process.cwd(), ...triggerSqlPath.split('/')))
      .toString();
  })
  .join('\n\n');

exports.triggers = triggers;
