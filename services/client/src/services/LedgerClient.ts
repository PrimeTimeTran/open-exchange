import { credentials } from '@grpc/grpc-js';
import {
  AssetServiceClient,
  OrderServiceClient,
  AccountServiceClient,
  WalletServiceClient,
  DepositServiceClient,
} from 'src/proto/ledger/ledger';
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

const assetClient = new AssetServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);
const orderClient = new OrderServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);
const accountClient = new AccountServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);
const walletClient = new WalletServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);
const depositClient = new DepositServiceClient(
  LEDGER_SERVICE_URL,
  credentials.createInsecure(),
);

export const ledgerClient = {
  getAsset: async (request: GetAssetRequest): Promise<GetAssetResponse> => {
    return new Promise((resolve, reject) => {
      assetClient.getAsset(request, (err, response) => {
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
      assetClient.listAssets(request, (err, response) => {
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
      accountClient.createAccount(request, (err, response) => {
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
      walletClient.createWallet(request, (err, response) => {
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
      depositClient.createDeposit(request, (err, response) => {
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
      accountClient.listAccounts(request, (err, response) => {
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
      walletClient.listWallets(request, (err, response) => {
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
    console.log('LedgerClient: recordOrder request:', request);
    return new Promise((resolve, reject) => {
      orderClient.recordOrder(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
