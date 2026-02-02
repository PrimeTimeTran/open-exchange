import { Prisma, User } from '@prisma/client';
import { uniq } from 'lodash';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import {
  prismaDangerouslyBypassAuth,
  prismaTransactionDangerouslyBypassAuth,
} from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import Error403 from 'src/shared/errors/Error403';
import Error404 from 'src/shared/errors/Error404';
import { formatTranslation } from 'src/translation/formatTranslation';

export async function membershipAcceptInvitation(
  user: User,
  invitationToken: string,
  forceAcceptOtherEmail: boolean,
  oauthExtraData: { firstName?: string; lastName?: string } | null,
  commitTransaction: boolean,
  context: AppContext,
) {
  if (!user) {
    throw new Error403();
  }

  const queries: Array<Prisma.PrismaPromise<any>> = [];

  const prisma = prismaDangerouslyBypassAuth(context);

  let membershipFromInvitation = await prisma.membership.findUnique({
    where: {
      invitationToken,
    },
    include: {
      user: true,
    },
  });

  if (
    !membershipFromInvitation ||
    !MembershipStatus.isInvited(membershipFromInvitation)
  ) {
    throw new Error404();
  }

  const isSameEmailAsInvitation = membershipFromInvitation.userId === user?.id;

  if (!forceAcceptOtherEmail && !isSameEmailAsInvitation) {
    throw new Error400(
      formatTranslation(
        context.dictionary.membership.errors.notSameEmail,
        membershipFromInvitation.user.email,
        user?.email,
      ),
    );
  }

  const membershipFromCurrentUser = await prisma.membership.findFirst({
    where: {
      tenantId: membershipFromInvitation.tenantId,
      userId: user?.id,
    },
  });

  const prismaWT = prismaTransactionDangerouslyBypassAuth(context);

  let membershipIdToActivate = membershipFromInvitation.id;

  // There might be a case that the invite was sent to another email,
  // and the current user is also invited or is already a member
  if (
    membershipFromCurrentUser &&
    membershipFromCurrentUser.id !== membershipFromInvitation.id
  ) {
    // Destroys the new invite, bc it will use the old one
    const destroyNewInviteQuery = prismaWT.membership.delete({
      where: {
        id: membershipFromInvitation.id,
      },
    });

    queries.push(destroyNewInviteQuery);

    membershipIdToActivate = membershipFromCurrentUser.id;
  }

  // Merges the roles from the invitation and the current membership
  const roles = uniq([
    ...membershipFromInvitation.roles,
    ...(membershipFromCurrentUser?.roles || []),
  ]);

  const activateInviteQuery = prismaWT.membership.update({
    where: {
      id: membershipIdToActivate,
    },
    data: {
      // Sometimes the invitation is sent not to the
      // correct email. In those cases the userId must be changed
      // to match the correct user.
      userId: user?.id,
      invitationToken: null,
      roles,
      firstName: oauthExtraData?.firstName || undefined,
      lastName: oauthExtraData?.lastName || undefined,
    },
  });

  queries.push(activateInviteQuery);

  const emailVerified = user?.emailVerified || isSameEmailAsInvitation;

  const userVerifiedQuery = prismaWT.user.update({
    where: { id: user?.id },
    data: { emailVerified },
  });

  queries.push(userVerifiedQuery);

  if (commitTransaction) {
    await prismaWT.$transaction(queries);

    return {
      tenantId: membershipFromInvitation.tenantId,
      acceptInvitationQueries: [],
      emailVerified,
    };
  }

  return {
    tenantId: membershipFromInvitation.tenantId,
    acceptInvitationQueries: queries,
    emailVerified,
  };
}
