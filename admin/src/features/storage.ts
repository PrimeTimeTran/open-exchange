/**
 * Storage permissions.
 *
 * @id - Used to identify the rule on permissions and upload.
 * @folder - Folder where the files will be saved
 * @maxSizeInBytes - Max allowed size in bytes
 * @publicRead - The file can be publicly accessed via the URL without the need for a signed token
 */

import { membershipStorage } from 'src/features/membership/membershipStorage';
import { postStorage } from 'src/features/post/postStorage';
import { commentStorage } from 'src/features/comment/commentStorage';
import { orderStorage } from 'src/features/order/orderStorage';
import { articleStorage } from 'src/features/article/articleStorage';
import { itemStorage } from 'src/features/item/itemStorage';
import { chatStorage } from 'src/features/chat/chatStorage';
import { chateeStorage } from 'src/features/chatee/chateeStorage';
import { messageStorage } from 'src/features/message/messageStorage';
import { assetStorage } from 'src/features/asset/assetStorage';
import { accountStorage } from 'src/features/account/accountStorage';
import { instrumentStorage } from 'src/features/instrument/instrumentStorage';
import { ledgerEventStorage } from 'src/features/ledgerEvent/ledgerEventStorage';
import { ledgerEntryStorage } from 'src/features/ledgerEntry/ledgerEntryStorage';
import { tradeStorage } from 'src/features/trade/tradeStorage';
import { tradeFillStorage } from 'src/features/tradeFill/tradeFillStorage';

export interface StorageConfig {
  id: string;
  folder: string;
  maxSizeInBytes: number;
  publicRead?: boolean;
}

export const storage = {
  ...membershipStorage,
  ...postStorage,
  ...commentStorage,
  ...orderStorage,
  ...articleStorage,
  ...itemStorage,
  ...chatStorage,
  ...chateeStorage,
  ...messageStorage,
  ...assetStorage,
  ...accountStorage,
  ...instrumentStorage,
  ...ledgerEventStorage,
  ...ledgerEntryStorage,
  ...tradeStorage,
  ...tradeFillStorage,
};
