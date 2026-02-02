import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipAutocompleteController } from 'src/features/membership/controllers/membershipAutocompleteController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('membershipAutocomplete', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  let prisma = prismaDangerouslyBypassAuth();

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';

    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();
    const currentMembership = await prisma.membership.findFirstOrThrow();
    currentTenant = await prisma.tenant.findFirstOrThrow();

    prisma = prismaDangerouslyBypassAuth({
      currentUser,
      currentMembership,
      currentTenant,
    });

    await prisma.membership.updateMany({
      data: {
        fullName: 'Felipe Lima',
      },
    });

    await prisma.user.create({
      data: {
        email: 'johndoe@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            fullName: 'John Doe',
            roles: [roles.custom],
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'arthur@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            fullName: 'Arthur Doe',
            invitationToken: 'INVITED',
            roles: [roles.custom],
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'zanedoe@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            fullName: 'Zane Doe',
            invitationToken: 'DISABLED AND INVITED',
            roles: [],
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'karldoe@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            fullName: 'Karl Doe',
            // Disabled
            roles: [],
          },
        },
      },
    });
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await membershipAutocompleteController({}, await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('success', () => {
    it('exclude ids', async () => {
      const membershipToExclude = await prisma.membership.findFirstOrThrow({
        where: {
          user: {
            email: 'johndoe@scaffoldhub.io',
          },
        },
      });

      const data = await membershipAutocompleteController(
        { exclude: [membershipToExclude.id] },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data.length).toEqual(4);
      data.map((membership) => {
        expect(membership.id).not.toEqual(membershipToExclude.id);
      });
    });

    it('filters by email - case insensitive', async () => {
      const data = await membershipAutocompleteController(
        { search: 'kARLdoe@' },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data[0].fullName).toEqual('Karl Doe');
    });

    it('filters by full name - case insensitive', async () => {
      const data = await membershipAutocompleteController(
        { search: 'KArl Do' },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.length).toEqual(1);
      expect(data[0].fullName).toEqual('Karl Doe');
    });

    it('take only limited results', async () => {
      const data = await membershipAutocompleteController(
        { take: 1 },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.length).toEqual(1);
    });

    it('order by full name', async () => {
      let data = await membershipAutocompleteController(
        {},
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.length).toEqual(5);
      expect(data[0].fullName).toEqual('Arthur Doe');

      data = await membershipAutocompleteController(
        {
          orderBy: {
            fullName: 'desc',
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.length).toEqual(5);
      expect(data[0].fullName).toEqual('Zane Doe');
    });

    it('order by email', async () => {
      let data = await membershipAutocompleteController(
        {
          orderBy: {
            user: { email: 'asc' },
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data.length).toEqual(5);
      expect(data[0].user.email).toEqual('arthur@scaffoldhub.io');

      data = await membershipAutocompleteController(
        {
          orderBy: {
            user: { email: 'desc' },
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.length).toEqual(5);
      expect(data[0].user.email).toEqual('zanedoe@scaffoldhub.io');
    });
  });
});
