/**
 * Storage permissions.
 *
 * @id - Used to identify the rule on permissions and upload.
 * @folder - Folder where the files will be saved
 * @maxSizeInBytes - Max allowed size in bytes
 * @publicRead - The file can be publicly accessed via the URL without the need for a signed token
 */

import { membershipStorage } from 'src/features/membership/membershipStorage';
import { accountStorage } from 'src/features/account/accountStorage';
import { depositStorage } from 'src/features/deposit/depositStorage';
import { withdrawalStorage } from 'src/features/withdrawal/withdrawalStorage';
import { walletStorage } from 'src/features/wallet/walletStorage';
import { orderStorage } from 'src/features/order/orderStorage';
import { fillStorage } from 'src/features/fill/fillStorage';
import { tradeStorage } from 'src/features/trade/tradeStorage';
import { assetStorage } from 'src/features/asset/assetStorage';
import { instrumentStorage } from 'src/features/instrument/instrumentStorage';
import { feeScheduleStorage } from 'src/features/feeSchedule/feeScheduleStorage';
import { balanceSnapshotStorage } from 'src/features/balanceSnapshot/balanceSnapshotStorage';
import { systemAccountStorage } from 'src/features/systemAccount/systemAccountStorage';
import { referralStorage } from 'src/features/referral/referralStorage';
import { listingStorage } from 'src/features/listing/listingStorage';
import { feedbackStorage } from 'src/features/feedback/feedbackStorage';
import { marketMakerStorage } from 'src/features/marketMaker/marketMakerStorage';
import { ledgerEventStorage } from 'src/features/ledgerEvent/ledgerEventStorage';
import { ledgerEntryStorage } from 'src/features/ledgerEntry/ledgerEntryStorage';
import { articleStorage } from 'src/features/article/articleStorage';
import { postStorage } from 'src/features/post/postStorage';
import { commentStorage } from 'src/features/comment/commentStorage';
import { chatStorage } from 'src/features/chat/chatStorage';
import { chaterStorage } from 'src/features/chater/chaterStorage';
import { messageStorage } from 'src/features/message/messageStorage';
import { notificationStorage } from 'src/features/notification/notificationStorage';
import { userNotificationStorage } from 'src/features/userNotification/userNotificationStorage';
import { jobStorage } from 'src/features/job/jobStorage';
import { candidateStorage } from 'src/features/candidate/candidateStorage';

export interface StorageConfig {
  id: string;
  folder: string;
  maxSizeInBytes: number;
  publicRead?: boolean;
}

export const storage = {
  ...membershipStorage,
  ...accountStorage,
  ...depositStorage,
  ...withdrawalStorage,
  ...walletStorage,
  ...orderStorage,
  ...fillStorage,
  ...tradeStorage,
  ...assetStorage,
  ...instrumentStorage,
  ...feeScheduleStorage,
  ...balanceSnapshotStorage,
  ...systemAccountStorage,
  ...referralStorage,
  ...listingStorage,
  ...feedbackStorage,
  ...marketMakerStorage,
  ...ledgerEventStorage,
  ...ledgerEntryStorage,
  ...articleStorage,
  ...postStorage,
  ...commentStorage,
  ...chatStorage,
  ...chaterStorage,
  ...messageStorage,
  ...notificationStorage,
  ...userNotificationStorage,
  ...jobStorage,
  ...candidateStorage,
};
