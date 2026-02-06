'use client';

import { membershipImportApiCall } from 'src/features/membership/membershipApiCalls';
import {
  membershipImportFileSchema,
  membershipImportInputSchema,
} from 'src/features/membership/membershipSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function MembershipImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={['email', 'firstName', 'lastName', 'roles', 'avatars']}
      labels={context.dictionary.membership.fields}
      context={context}
      validationSchema={membershipImportInputSchema}
      fileSchema={membershipImportFileSchema}
      importerFn={membershipImportApiCall}
      breadcrumbRoot={[context.dictionary.membership.list.menu, '/membership']}
      queryKeyToInvalidate={['membership']}
    />
  );
}
