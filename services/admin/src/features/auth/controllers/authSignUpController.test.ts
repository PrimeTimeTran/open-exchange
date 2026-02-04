import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { jwtVerify } from 'src/shared/lib/jwt';
import { testContext } from 'src/shared/test/testContext';
import { ZodError } from 'zod';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('authSignUp', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let token: string;

  describe('validation', () => {
    it('email is a required field', async () => {
      try {
        await authSignUpController(
          {
            password: '12345678',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['email']);
          expect(error.errors[0].code).toBe('invalid_type');
        }
      }
    });

    it('password is a required field', async () => {
      try {
        await authSignUpController(
          {
            email: 'felipe+1@scaffoldhub.io',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['password']);
          expect(error.errors[0].code).toBe('invalid_type');
        }
      }
    });

    it('email must be a valid email', async () => {
      try {
        await authSignUpController(
          {
            email: 'invalid',
            password: '12345678',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['email']);
          expect(error.errors[0].code).toBe('invalid_string');
        }
      }
    });

    it('password must be at least 8 characters', async () => {
      try {
        await authSignUpController(
          {
            email: 'felipe@scaffoldhub.io',
            password: '1234',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['password']);
          expect(error.errors[0].code).toBe('too_small');
        }
      }
    });
  });

  describe('single tenant', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
    });

    beforeEach(async () => {
      const payload = await authSignUpController(
        {
          email: 'felipe@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );
      token = payload.token;
    });

    it('returns jwt token', async () => {
      let currentUser = await prisma.user.findFirstOrThrow();
      expect(jwtVerify(token).id).toBe(currentUser.id);
    });

    it('creates the first user', async () => {
      const user = await prisma.user.findFirst({
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });
      expect(user?.email).toBe('felipe@scaffoldhub.io');
      expect(user?.password).not.toBeNull();
      expect(user?.memberships?.length).toBe(1);
    });

    it('creates the first user as an active admin', async () => {
      const user = await prisma.user.findFirst({
        include: {
          memberships: true,
        },
      });
      expect(user?.memberships?.length).toBe(1);
      expect(user?.memberships?.[0]?.roles).toEqual([roles.admin]);
      expect(MembershipStatus.isActive(user?.memberships?.[0])).toBeTruthy();
    });

    it('creates the single tenant', async () => {
      const user = await prisma.user.findFirst({
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      expect(user?.memberships?.[0]?.tenant?.name).toBe('default');
    });

    it('creates the next users with no permissions', async () => {
      await authSignUpController(
        {
          email: 'felipe+2@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );

      const user = await prisma.user.findFirst({
        where: {
          email: 'felipe+2@scaffoldhub.io',
        },
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      expect(user?.memberships?.length).toBe(1);
      expect(user?.memberships?.[0]?.roles).toEqual([]);
      expect(MembershipStatus.isDisabled(user?.memberships?.[0])).toBeTruthy();
    });

    describe('invitation', () => {
      beforeEach(async () => {
        let currentUser = await prisma.user.findFirst({
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
          },
        });

        await membershipCreateController(
          { email: 'invited@scaffoldhub.io', roles: [roles.admin] },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentUser?.memberships?.[0]?.tenant?.id,
          }),
        );
      });

      it('accepts valid invitation', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isActive(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('accepts invitation if email matches even if invitation token is wrong', async () => {
        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );

        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isActive(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('accepts valid invitation with other email and cancel for original one', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        let anotherUserWithToken = await prisma.user.findFirst({
          where: {
            email: 'anotheruseremail@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isActive(anotherUserWithToken?.memberships[0]),
        ).toBeTruthy();

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('ignores wrong invitation token if used another email', async () => {
        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );

        let anotherUser = await prisma.user.findFirst({
          where: {
            email: 'anotheruseremail@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(anotherUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('keeps user disabled when accept invitation', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        let _prismaAuth = prismaDangerouslyBypassAuth({
          currentUser: invitedUser,
        });

        // Disable invited user
        await _prismaAuth.membership.update({
          where: {
            id: invitedUser?.memberships[0].id,
          },
          data: {
            roles: [],
          },
        });

        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });
    });
  });

  describe('multi tenant', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let token: string;

    beforeAll(() => {
      originalEnv = process.env;
      process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    beforeEach(async () => {
      const payload = await authSignUpController(
        {
          email: 'felipe@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );

      token = payload.token;
    });

    it('returns jwt token', async () => {
      let currentUser = await prisma.user.findFirstOrThrow();
      expect(jwtVerify(token).id).toBe(currentUser.id);
    });

    it('creates the first user', async () => {
      const user = await prisma.user.findFirst();
      expect(user?.email).toBe('felipe@scaffoldhub.io');
      expect(user?.password).not.toBeNull();
    });

    it('creates with no memberships', async () => {
      const user = await prisma.user.findFirst({
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      expect(user?.memberships?.length).toBe(0);
    });

    it('creates no tenant', async () => {
      const tenantCount = await prisma.tenant.count();
      expect(tenantCount).toBe(0);
    });

    describe('invitation', () => {
      beforeEach(async () => {
        let currentUser = await prisma.user.findFirstOrThrow({
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
          },
        });

        await tenantCreateController(
          { name: 'ScaffoldHub' },
          await testContext({
            currentUserId: currentUser.id,
          }),
        );

        currentUser = await prisma.user.findFirstOrThrow({
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
          },
        });

        await membershipCreateController(
          { email: 'invited@scaffoldhub.io', roles: [roles.admin] },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentUser?.memberships?.[0]?.tenant?.id,
          }),
        );
      });

      it('accepts valid invitation', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isActive(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('ignores if invitation token is wrong', async () => {
        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );

        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isInvited(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('accepts valid invitation with other email and cancel for original one', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        let anotherUserWithToken = await prisma.user.findFirst({
          where: {
            email: 'anotheruseremail@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isActive(anotherUserWithToken?.memberships[0]),
        ).toBeTruthy();

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('ignores wrong invitation token if used another email', async () => {
        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );

        let anotherUser = await prisma.user.findFirst({
          where: {
            email: 'anotheruseremail@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(anotherUser?.memberships[0]),
        ).toBeTruthy();
      });

      it('keeps user disabled when accept invitation', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        let _prismaAuth = prismaDangerouslyBypassAuth({
          currentUser: invitedUser,
        });

        // Disable invited user
        await _prismaAuth.membership.update({
          where: {
            id: invitedUser?.memberships[0].id,
          },
          data: {
            roles: [],
          },
        });

        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );

        invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(invitedUser?.memberships[0]),
        ).toBeTruthy();
      });
    });
  });
});
