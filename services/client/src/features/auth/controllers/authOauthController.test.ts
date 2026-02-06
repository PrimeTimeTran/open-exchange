import { authOauthController } from 'src/features/auth/controllers/authOauthController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { jwtVerify } from 'src/shared/lib/jwt';
import { testContext } from 'src/shared/test/testContext';
import { ZodError } from 'zod';

const mockSendEmail = jest.fn();
const mockOauthValidateCode = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

jest.mock('src/features/auth/authFacebookOauth', () => {
  return {
    authFacebookValidateCode() {
      return mockOauthValidateCode();
    },
  };
});
jest.mock('src/features/auth/authGoogleOauth', () => {
  return {
    authGoogleValidateCode() {
      return mockOauthValidateCode();
    },
  };
});
jest.mock('src/features/auth/authGithubOauth', () => {
  return {
    authGithubValidateCode() {
      return mockOauthValidateCode();
    },
  };
});

describe('authOauth', () => {
  beforeEach(async () => {
    mockOauthValidateCode.mockImplementation(() =>
      Promise.resolve({
        email: 'felipe@scaffoldhub.io',
      }),
    );
  });

  let prisma = prismaDangerouslyBypassAuth();
  let token: string;

  describe('code', () => {
    it('code is a required field', async () => {
      try {
        await authOauthController(
          {
            oauthProvider: 'facebook',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['code']);
          expect(error.errors[0].code).toBe('invalid_type');
        }
      }
    });

    it('oauthProvider is a required field', async () => {
      try {
        await authOauthController(
          {
            code: 'code',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['oauthProvider']);
          expect(error.errors[0].code).toBe('invalid_type');
        }
      }
    });

    it('oauthProvider must be valid', async () => {
      try {
        await authOauthController(
          {
            oauthProvider: 'invalid',
            code: 'code',
          },
          await testContext(),
        );
        fail();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['oauthProvider']);
          expect(error.errors[0].code).toBe('invalid_enum_value');
        }
      }
    });
  });

  describe('single tenant', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
    });

    beforeEach(async () => {
      const payload = await authOauthController(
        {
          oauthProvider: 'google',
          code: 'code',
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
      mockOauthValidateCode.mockImplementation(() =>
        Promise.resolve({
          email: 'felipe+2@scaffoldhub.io',
        }),
      );

      await authOauthController(
        {
          oauthProvider: 'google',
          code: 'code',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'anotheruseremail@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'anotheruseremail@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
      const payload = await authOauthController(
        {
          oauthProvider: 'google',
          code: '12345678',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'anotheruseremail@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'anotheruseremail@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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

        mockOauthValidateCode.mockImplementation(() =>
          Promise.resolve({
            email: 'invited@scaffoldhub.io',
          }),
        );

        await authOauthController(
          {
            oauthProvider: 'google',
            code: 'code',
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
