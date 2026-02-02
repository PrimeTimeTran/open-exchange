import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { membershipAcceptInvitationApiDoc } from 'src/features/membership/controllers/membershipAcceptInvitationController';
import { membershipAutocompleteApiDoc } from 'src/features/membership/controllers/membershipAutocompleteController';
import { membershipCreateApiDoc } from 'src/features/membership/controllers/membershipCreateController';
import { membershipDeclineInvitationApiDoc } from 'src/features/membership/controllers/membershipDeclineInvitationController';
import { membershipDestroyManyApiDoc } from 'src/features/membership/controllers/membershipDestroyManyController';
import { membershipFindApiDoc } from 'src/features/membership/controllers/membershipFindController';
import { membershipFindManyApiDoc } from 'src/features/membership/controllers/membershipFindManyController';
import { membershipImportApiDoc } from 'src/features/membership/controllers/membershipImporterController';
import { membershipResendInvitationEmailApiDoc } from 'src/features/membership/controllers/membershipResentInvitationEmailController';
import { membershipUpdateApiDoc } from 'src/features/membership/controllers/membershipUpdateController';
import { membershipUpdateMeApiDoc } from 'src/features/membership/controllers/membershipUpdateMeController';

export function membershipApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    membershipAutocompleteApiDoc,
    membershipCreateApiDoc,
    membershipDestroyManyApiDoc,
    membershipFindApiDoc,
    membershipFindManyApiDoc,
    membershipImportApiDoc,
    membershipResendInvitationEmailApiDoc,
    membershipUpdateApiDoc,
    membershipUpdateMeApiDoc,
  ].map((apiDocWithSecurity) => {
    registry.registerPath({
      ...apiDocWithSecurity,
      tags: ['Membership'],
      security,
    });
  });

  [membershipAcceptInvitationApiDoc, membershipDeclineInvitationApiDoc].map(
    (apiDoc) => {
      registry.registerPath({
        ...apiDoc,
        tags: ['Membership'],
      });
    },
  );
}
