// @ts-ignore
const path = require('path');
// @ts-ignore
const fs = require('fs');

// @ts-ignore
const triggers = [
  'src/features/auditLog/auditLogTriggers.sql',
  'src/features/account/accountTriggers.sql',
  'src/features/deposit/depositTriggers.sql',
  'src/features/withdrawal/withdrawalTriggers.sql',
  'src/features/wallet/walletTriggers.sql',
  'src/features/order/orderTriggers.sql',
  'src/features/fill/fillTriggers.sql',
  'src/features/trade/tradeTriggers.sql',
  'src/features/asset/assetTriggers.sql',
  'src/features/instrument/instrumentTriggers.sql',
  'src/features/feeSchedule/feeScheduleTriggers.sql',
  'src/features/balanceSnapshot/balanceSnapshotTriggers.sql',
  'src/features/systemAccount/systemAccountTriggers.sql',
  'src/features/referral/referralTriggers.sql',
  'src/features/listing/listingTriggers.sql',
  'src/features/feedback/feedbackTriggers.sql',
  'src/features/marketMaker/marketMakerTriggers.sql',
  'src/features/ledgerEvent/ledgerEventTriggers.sql',
  'src/features/ledgerEntry/ledgerEntryTriggers.sql',
  'src/features/article/articleTriggers.sql',
  'src/features/post/postTriggers.sql',
  'src/features/comment/commentTriggers.sql',
  'src/features/chat/chatTriggers.sql',
  'src/features/chater/chaterTriggers.sql',
  'src/features/message/messageTriggers.sql',
  'src/features/notification/notificationTriggers.sql',
  'src/features/userNotification/userNotificationTriggers.sql',
  'src/features/job/jobTriggers.sql',
  'src/features/candidate/candidateTriggers.sql',
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
