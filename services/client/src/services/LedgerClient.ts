import { credentials } from '@grpc/grpc-js';
import { LedgerServiceClient } from 'src/proto/ledger/ledger';
import {
  ListWalletsRequest,
  ListWalletsResponse,
  RecordOrderRequest,
  RecordOrderResponse,
  ListAccountsRequest,
  ListAccountsResponse,
  CreateAccountRequest,
  CreateAccountResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  CreateDepositRequest,
  CreateDepositResponse,
  GetAssetRequest,
  GetAssetResponse,
  ListAssetsRequest,
  ListAssetsResponse,
} from 'src/proto/ledger/ledger';

const LEDGER_SERVICE_URL = process.env.LEDGER_SERVICE_URL || 'localhost:50052';

console.log('LedgerClient: Connecting to', LEDGER_SERVICE_URL);

const client = new LedgerServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);

export const ledgerClient = {
  getAsset: async (request: GetAssetRequest): Promise<GetAssetResponse> => {
    return new Promise((resolve, reject) => {
      client.getAsset(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  listAssets: async (
    request: ListAssetsRequest,
  ): Promise<ListAssetsResponse> => {
    return new Promise((resolve, reject) => {
      client.listAssets(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  createAccount: async (
    request: CreateAccountRequest,
  ): Promise<CreateAccountResponse> => {
    return new Promise((resolve, reject) => {
      client.createAccount(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  createWallet: async (
    request: CreateWalletRequest,
  ): Promise<CreateWalletResponse> => {
    return new Promise((resolve, reject) => {
      client.createWallet(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  createDeposit: async (
    request: CreateDepositRequest,
  ): Promise<CreateDepositResponse> => {
    return new Promise((resolve, reject) => {
      client.createDeposit(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  listAccounts: async (
    request: ListAccountsRequest,
  ): Promise<ListAccountsResponse> => {
    return new Promise((resolve, reject) => {
      client.listAccounts(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

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

  recordOrder: async (
    request: RecordOrderRequest,
  ): Promise<RecordOrderResponse> => {
    return new Promise((resolve, reject) => {
      client.recordOrder(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
