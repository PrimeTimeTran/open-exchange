import { credentials } from '@grpc/grpc-js';
import { LedgerServiceClient } from 'src/proto/ledger/ledger';
import {
  ListWalletsRequest,
  ListWalletsResponse,
} from 'src/proto/ledger/ledger';

const LEDGER_SERVICE_URL = process.env.LEDGER_SERVICE_URL || 'localhost:50053';

console.log('LedgerClient: Connecting to', LEDGER_SERVICE_URL);

const client = new LedgerServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);

export const ledgerClient = {
  listWallets: async (
    request: ListWalletsRequest,
  ): Promise<ListWalletsResponse> => {
    return new Promise((resolve, reject) => {
      client.listWallets(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
