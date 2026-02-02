import { authSignInController } from 'src/features/auth/controllers/authSignInController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { jwtVerify } from 'src/shared/lib/jwt';
import { testContext } from 'src/shared/test/testContext';
import { ZodError } from 'zod';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('authSignIn', () => {
  const prisma = prismaDangerouslyBypassAuth();

  describe('validation', () => {
    it('email is a required field', async () => {
      try {
        await authSignInController(
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
        await authSignInController(
          {
            email: 'felipe+1@scaffoldhub.io',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['password']);
          expect(error.errors[0].code).toBe('invalid_type');
        }
      }
    });

    it('email must be a valid email', async () => {
      try {
        await authSignInController(
          {
            email: 'invalid',
            password: '12345678',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        if (error instanceof ZodError) {
          expect(error.errors[0].path).toEqual(['email']);
          expect(error.errors[0].code).toBe('invalid_string');
        }
      }
    });

    it('password must be at least 8 characters', async () => {
      try {
        await authSignInController(
          {
            email: 'felipe@scaffoldhub.io',
            password: '1234',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
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
      await authSignUpController(
        {
          email: 'felipe@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );
    });

    it('rejects wrong password', async () => {
      try {
        await authSignInController(
          {
            email: 'felipe@scaffoldhub.io',
            password: 'wrongpassword',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error.code).toBe(400);
        expect(error.message).toBe(
          `Sorry, we don't recognize your credentials`,
        );
      }
    });

    it('signs in', async () => {
      const { token } = await authSignInController(
        {
          email: 'felipe@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );

      const decodedToken = jwtVerify(token);
      let currentUser = await prisma.user.findFirstOrThrow();
      expect(decodedToken.id).toBe(currentUser.id);
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
          },
          await testContext(),
        );

        const { token } = await authSignInController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

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
          },
          await testContext(),
        );

        const { token } = await authSignInController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

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

      it('keeps user disabled when invitation is w/ no roles', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        // Disable
        await prisma.membership.update({
          where: {
            id: invitedUser?.memberships[0].id,
          },
          data: {
            roles: [],
          },
        });

        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
          },
          await testContext(),
        );

        const { token } = await authSignInController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

        let anotherUserWithToken = await prisma.user.findFirst({
          where: {
            email: 'anotheruseremail@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        expect(
          MembershipStatus.isDisabled(anotherUserWithToken?.memberships[0]),
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
    });
  });

  describe('multi tenant', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
      originalEnv = process.env;
      process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    beforeEach(async () => {
      await authSignUpController(
        {
          email: 'felipe@scaffoldhub.io',
          password: '12345678',
        },
        await testContext(),
      );

      const currentUser = await prisma.user.findFirstOrThrow({
        where: {
          email: 'felipe@scaffoldhub.io',
        },
      });

      await tenantCreateController(
        { name: 'ScaffoldHub' },
        await testContext({
          currentUserId: currentUser.id,
        }),
      );
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
        await authSignUpController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
          },
          await testContext(),
        );

        let invitedUser = await prisma.user.findFirstOrThrow({
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

        const { token } = await authSignInController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

        const decodedToken = jwtVerify(token);
        expect(decodedToken.id).toBe(invitedUser.id);

        invitedUser = await prisma.user.findFirstOrThrow({
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
          },
          await testContext(),
        );

        const { token } = await authSignInController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: 'INVALID INVITATION TOKEN',
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

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
        await authSignUpController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
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

        const { token } = await authSignInController(
          {
            email: 'anotheruseremail@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

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

      it('keeps user disabled when accept invitation with no roles', async () => {
        let invitedUser = await prisma.user.findFirst({
          where: {
            email: 'invited@scaffoldhub.io',
          },
          include: {
            memberships: true,
          },
        });

        const _prismaAuth = prismaDangerouslyBypassAuth({
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
          },
          await testContext(),
        );

        const { token } = await authSignInController(
          {
            email: 'invited@scaffoldhub.io',
            password: '12345678',
            invitationToken: invitedUser?.memberships[0].invitationToken,
          },
          await testContext(),
        );
        expect(token).not.toBeNull();

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
