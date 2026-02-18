import { credentials } from '@grpc/grpc-js';
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

const promisify = <TReq, TRes>(
  fn: (req: TReq, callback: (err: any, response: TRes) => void) => void,
  req: TReq,
): Promise<TRes> => {
  return new Promise((resolve, reject) => {
    fn(req, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};

export const ledgerClient = {
  getAsset: (request: GetAssetRequest): Promise<GetAssetResponse> =>
    promisify(assetClient.getAsset.bind(assetClient), request),

  listAssets: (request: ListAssetsRequest): Promise<ListAssetsResponse> =>
    promisify(assetClient.listAssets.bind(assetClient), request),

  createAccount: (
    request: CreateAccountRequest,
  ): Promise<CreateAccountResponse> =>
    promisify(accountClient.createAccount.bind(accountClient), request),

  createWallet: (request: CreateWalletRequest): Promise<CreateWalletResponse> =>
    promisify(walletClient.createWallet.bind(walletClient), request),

  createDeposit: (
    request: CreateDepositRequest,
  ): Promise<CreateDepositResponse> =>
    promisify(depositClient.createDeposit.bind(depositClient), request),

  listAccounts: (request: ListAccountsRequest): Promise<ListAccountsResponse> =>
    promisify(accountClient.listAccounts.bind(accountClient), request),

  listWallets: (request: ListWalletsRequest): Promise<ListWalletsResponse> =>
    promisify(walletClient.listWallets.bind(walletClient), request),

  recordOrder: (request: RecordOrderRequest): Promise<RecordOrderResponse> => {
    console.log('LedgerClient: recordOrder request:', request);
    return promisify(orderClient.recordOrder.bind(orderClient), request);
  },
};
