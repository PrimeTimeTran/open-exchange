import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { walletAutocompleteApiDoc } from 'src/features/wallet/controllers/walletAutocompleteController';
import { walletCreateApiDoc } from 'src/features/wallet/controllers/walletCreateController';
import { walletDestroyManyApiDoc } from 'src/features/wallet/controllers/walletDestroyManyController';
import { walletFindApiDoc } from 'src/features/wallet/controllers/walletFindController';
import { walletFindManyApiDoc } from 'src/features/wallet/controllers/walletFindManyController';
import { walletImportApiDoc } from 'src/features/wallet/controllers/walletImporterController';
import { walletUpdateApiDoc } from 'src/features/wallet/controllers/walletUpdateController';
import { walletArchiveManyApiDoc } from 'src/features/wallet/controllers/walletArchiveManyController';
import { walletRestoreManyApiDoc } from 'src/features/wallet/controllers/walletRestoreManyController';

export function walletApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    walletAutocompleteApiDoc,
    walletCreateApiDoc,
    walletArchiveManyApiDoc,
    walletRestoreManyApiDoc,
    walletDestroyManyApiDoc,
    walletFindApiDoc,
    walletFindManyApiDoc,
    walletUpdateApiDoc,
    walletImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Wallet'],
      security,
    });
  });
}
