import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotAutocompleteApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotAutocompleteController';
import { balanceSnapshotCreateApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotCreateController';
import { balanceSnapshotDestroyManyApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotDestroyManyController';
import { balanceSnapshotFindApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotFindController';
import { balanceSnapshotFindManyApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotFindManyController';
import { balanceSnapshotImportApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotImporterController';
import { balanceSnapshotUpdateApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotUpdateController';
import { balanceSnapshotArchiveManyApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotArchiveManyController';
import { balanceSnapshotRestoreManyApiDoc } from 'src/features/balanceSnapshot/controllers/balanceSnapshotRestoreManyController';

export function balanceSnapshotApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    balanceSnapshotAutocompleteApiDoc,
    balanceSnapshotCreateApiDoc,
    balanceSnapshotArchiveManyApiDoc,
    balanceSnapshotRestoreManyApiDoc,
    balanceSnapshotDestroyManyApiDoc,
    balanceSnapshotFindApiDoc,
    balanceSnapshotFindManyApiDoc,
    balanceSnapshotUpdateApiDoc,
    balanceSnapshotImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['BalanceSnapshot'],
      security,
    });
  });
}
