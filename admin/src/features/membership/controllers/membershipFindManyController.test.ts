import { Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipFindManyController } from 'src/features/membership/controllers/membershipFindManyController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('membershipFindMany', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;
  let currentTenant: Tenant;

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
    let currentMembership = await prisma.membership.findFirstOrThrow();
    currentTenant = await prisma.tenant.findFirstOrThrow();

    prisma = prismaDangerouslyBypassAuth({
      currentUser,
      currentMembership,
      currentTenant,
    });

    await prisma.membership.updateMany({
      data: {
        firstName: 'Felipe',
        lastName: 'Lima',
      },
    });

    await prisma.user.create({
      data: {
        email: 'johndoe@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            firstName: 'John',
            lastName: 'Doe',
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
            firstName: 'Arthur',
            lastName: 'Doe',
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
            firstName: 'Zane',
            lastName: 'Doe',
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
            firstName: 'Karl',
            lastName: 'Doe',
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
        await membershipFindManyController({}, await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have permission', async () => {
      await prisma.membership.updateMany({
        where: { userId: currentUser?.id, tenantId: currentTenant?.id },
        data: {
          // this role has no access
          roles: [roles.custom],
        },
      });

      try {
        await membershipFindManyController(
          { filter: { firstName: 'John' } },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('success', () => {
    it('filters by email - case insensitive', async () => {
      const data = await membershipFindManyController(
        { filter: { email: 'karldoe@' } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.memberships.length).toEqual(1);
      expect(data.memberships[0].firstName).toEqual('Karl');
    });

    it('filters by first name - case insensitive', async () => {
      const data = await membershipFindManyController(
        { filter: { firstName: 'KArl' } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.memberships.length).toEqual(1);
      expect(data.memberships[0].firstName).toEqual('Karl');
    });

    it('filters by last name - case insensitive', async () => {
      const data = await membershipFindManyController(
        { filter: { lastName: 'Doe' } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(4);
      expect(data.memberships.length).toEqual(4);
      expect(data.memberships[0].lastName).toEqual('Doe');
    });

    it('filters by role', async () => {
      const data = await membershipFindManyController(
        { filter: { roles: [roles.admin] } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.memberships.length).toEqual(1);
      expect(data.memberships[0].roles).toEqual([roles.admin]);
    });

    it('filters by status - invited', async () => {
      const data = await membershipFindManyController(
        { filter: { statuses: [MembershipStatus.invited] } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.memberships.length).toEqual(1);
      expect(data.memberships[0].user.email).toEqual('arthur@scaffoldhub.io');
    });

    it('removes invitation token from payload', async () => {
      const data = await membershipFindManyController(
        { filter: { statuses: [MembershipStatus.invited] } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.memberships.length).toEqual(1);
      expect(data.memberships[0].invitationToken).toBeFalsy();
    });

    it('filters by status - disabled', async () => {
      const data = await membershipFindManyController(
        { filter: { statuses: [MembershipStatus.disabled] } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
      expect(data.memberships.length).toEqual(2);
      expect(data.memberships[0].roles).toEqual([]);
    });

    it('filters by status - active', async () => {
      const data = await membershipFindManyController(
        { filter: { statuses: [MembershipStatus.active] } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
      expect(data.memberships.length).toEqual(2);
      expect(data.memberships[0].invitationToken).toEqual(null);
    });

    it('throw error on invalid status', async () => {
      try {
        await membershipFindManyController(
          { filter: { statuses: ['INVALID'] } },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.errors[0].path).toEqual(['filter', 'statuses', 0]);
        expect(error.errors[0].code).toEqual('invalid_enum_value');
      }
    });

    it('filters by createdAt', async () => {
      let data = await membershipFindManyController(
        {
          filter: {
            createdAtRange: [
              dayjs().subtract(1, 'day').toISOString(),
              dayjs().subtract(2, 'days').toISOString(),
            ],
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(0);

      data = await membershipFindManyController(
        {
          filter: {
            createdAtRange: [
              dayjs().subtract(1, 'day').toISOString(),
              dayjs().add(1, 'days').toISOString(),
            ],
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
    });

    it('paginates', async () => {
      const data = await membershipFindManyController(
        { take: 1 },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
      expect(data.memberships.length).toEqual(1);
    });

    it('order by first name', async () => {
      let data = await membershipFindManyController(
        {
          take: 1,
          orderBy: {
            firstName: 'asc',
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
      expect(data.memberships[0].firstName).toEqual('Arthur');

      data = await membershipFindManyController(
        { take: 1, orderBy: { firstName: 'desc' } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
      expect(data.memberships[0].firstName).toEqual('Zane');
    });

    it('order by email', async () => {
      let data = await membershipFindManyController(
        {
          take: 1,
          orderBy: {
            user: { email: 'asc' },
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
      expect(data.memberships[0].user.email).toEqual('arthur@scaffoldhub.io');

      data = await membershipFindManyController(
        {
          take: 1,
          orderBy: {
            user: { email: 'desc' },
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(5);
      expect(data.memberships[0].user.email).toEqual('zanedoe@scaffoldhub.io');
    });
  });
});
