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
import { walletStorage } from 'src/features/wallet/walletStorage';
import { depositStorage } from 'src/features/deposit/depositStorage';
import { withdrawalStorage } from 'src/features/withdrawal/withdrawalStorage';
import { orderStorage } from 'src/features/order/orderStorage';
import { assetStorage } from 'src/features/asset/assetStorage';
import { instrumentStorage } from 'src/features/instrument/instrumentStorage';
import { ledgerEventStorage } from 'src/features/ledgerEvent/ledgerEventStorage';
import { ledgerEntryStorage } from 'src/features/ledgerEntry/ledgerEntryStorage';
import { tradeStorage } from 'src/features/trade/tradeStorage';
import { fillStorage } from 'src/features/fill/fillStorage';
import { postStorage } from 'src/features/post/postStorage';
import { commentStorage } from 'src/features/comment/commentStorage';
import { articleStorage } from 'src/features/article/articleStorage';
import { chatStorage } from 'src/features/chat/chatStorage';
import { chateeStorage } from 'src/features/chatee/chateeStorage';
import { messageStorage } from 'src/features/message/messageStorage';
import { feeScheduleStorage } from 'src/features/feeSchedule/feeScheduleStorage';
import { balanceSnapshotStorage } from 'src/features/balanceSnapshot/balanceSnapshotStorage';
import { systemAccountStorage } from 'src/features/systemAccount/systemAccountStorage';
import { feedbackStorage } from 'src/features/feedback/feedbackStorage';

export interface StorageConfig {
  id: string;
  folder: string;
  maxSizeInBytes: number;
  publicRead?: boolean;
}

export const storage = {
  ...membershipStorage,
  ...accountStorage,
  ...walletStorage,
  ...depositStorage,
  ...withdrawalStorage,
  ...orderStorage,
  ...assetStorage,
  ...instrumentStorage,
  ...ledgerEventStorage,
  ...ledgerEntryStorage,
  ...tradeStorage,
  ...fillStorage,
  ...postStorage,
  ...commentStorage,
  ...articleStorage,
  ...chatStorage,
  ...chateeStorage,
  ...messageStorage,
  ...feeScheduleStorage,
  ...balanceSnapshotStorage,
  ...systemAccountStorage,
  ...feedbackStorage,
};
