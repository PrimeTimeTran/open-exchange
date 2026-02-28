import {
  AssetServiceClient,
  OrderServiceClient,
  WalletServiceClient,
  AccountServiceClient,
  DepositServiceClient,
} from 'src/proto/ledger/ledger';
import {
  GetAssetRequest,
  GetAssetResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  ListWalletsRequest,
  RecordOrderRequest,
  ListWalletsResponse,
  RecordOrderResponse,
  ListAccountsRequest,
  CreateWalletRequest,
  ListAccountsResponse,
  CreateAccountRequest,
  CreateWalletResponse,
  CreateDepositRequest,
  CreateAccountResponse,
  CreateDepositResponse,
} from 'src/proto/ledger/ledger';
import { promisify } from './grpc-helpers';
import { createLazyClient } from './lazy-client';

const LEDGER_SERVICE_URL = process.env.LEDGER_SERVICE_URL || 'localhost:50052';

const getAssetClient = createLazyClient(
  AssetServiceClient,
  LEDGER_SERVICE_URL,
  'Ledger Asset Service',
);
const getOrderClient = createLazyClient(
  OrderServiceClient,
  LEDGER_SERVICE_URL,
  'Ledger Order Service',
);
const getAccountClient = createLazyClient(
  AccountServiceClient,
  LEDGER_SERVICE_URL,
  'Ledger Account Service',
);
const getWalletClient = createLazyClient(
  WalletServiceClient,
  LEDGER_SERVICE_URL,
  'Ledger Wallet Service',
);
const getDepositClient = createLazyClient(
  DepositServiceClient,
  LEDGER_SERVICE_URL,
  'Ledger Deposit Service',
);

export const ledgerClient = {
  getAsset: (request: GetAssetRequest): Promise<GetAssetResponse> =>
    promisify(getAssetClient().getAsset.bind(getAssetClient()), request),

  listAssets: (request: ListAssetsRequest): Promise<ListAssetsResponse> =>
    promisify(getAssetClient().listAssets.bind(getAssetClient()), request),

  createAccount: (
    request: CreateAccountRequest,
  ): Promise<CreateAccountResponse> =>
    promisify(
      getAccountClient().createAccount.bind(getAccountClient()),
      request,
    ),

  createWallet: (request: CreateWalletRequest): Promise<CreateWalletResponse> =>
    promisify(getWalletClient().createWallet.bind(getWalletClient()), request),

  createDeposit: (
    request: CreateDepositRequest,
  ): Promise<CreateDepositResponse> =>
    promisify(
      getDepositClient().createDeposit.bind(getDepositClient()),
      request,
    ),

  listAccounts: (request: ListAccountsRequest): Promise<ListAccountsResponse> =>
    promisify(
      getAccountClient().listAccounts.bind(getAccountClient()),
      request,
    ),

  listWallets: (request: ListWalletsRequest): Promise<ListWalletsResponse> =>
    promisify(getWalletClient().listWallets.bind(getWalletClient()), request),

  recordOrder: (request: RecordOrderRequest): Promise<RecordOrderResponse> => {
    console.log('LedgerClient: recordOrder request:', request);
    return promisify(
      getOrderClient().recordOrder.bind(getOrderClient()),
      request,
    );
  },
};
