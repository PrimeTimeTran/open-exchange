import { User } from '@prisma/client';
import dayjs from 'dayjs';
import { authPasswordResetConfirmController } from 'src/features/auth/controllers/authPasswordResetConfirmController';
import { authPasswordResetRequestController } from 'src/features/auth/controllers/authPasswordResetRequestController';
import { authSignInController } from 'src/features/auth/controllers/authSignInController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { testContext } from 'src/shared/test/testContext';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('authPasswordReset', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;

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
    currentUser = await prisma.user.findFirstOrThrow();
  });

  describe('request', () => {
    it('send password reset request', async () => {
      mockSendEmail.mockClear();

      await authPasswordResetRequestController(
        {
          email: 'felipe@scaffoldhub.io',
        },
        await testContext(),
      );

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('fills password reset token and expiration', async () => {
      expect(currentUser.passwordResetToken).toBeNull();
      expect(currentUser.passwordResetTokenExpiresAt).toBeNull();

      await authPasswordResetRequestController(
        {
          email: 'felipe@scaffoldhub.io',
        },
        await testContext(),
      );

      currentUser = await prisma.user.findFirstOrThrow();
      expect(currentUser.passwordResetToken).toBeTruthy();
      expect(currentUser.passwordResetTokenExpiresAt).toBeTruthy();
    });

    it('fails when user is not found', async () => {
      expect(currentUser.passwordResetToken).toBeNull();
      expect(currentUser.passwordResetTokenExpiresAt).toBeNull();

      try {
        await authPasswordResetRequestController(
          {
            email: 'emailnotfound@scaffoldhub.io',
          },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error.message).toBe('Email not found');
      }
    });
  });

  describe('confirm', () => {
    it('rejects invalid reset token', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          passwordResetToken: 'valid',
          passwordResetTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      try {
        await authPasswordResetConfirmController(
          { password: 'changedpassword', token: 'invalid' },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error.message).toBe(
          'Password reset link is invalid or has expired',
        );
      }
    });

    it('rejects expired token', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          passwordResetToken: 'valid',
          // past date
          passwordResetTokenExpiresAt: dayjs().subtract(1, 'day').toDate(),
        },
      });

      try {
        await authPasswordResetConfirmController(
          {
            password: 'changedpassword',
            token: 'valid',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error.message).toBe(
          'Password reset link is invalid or has expired',
        );
      }
    });

    it('changes password and clear token from db', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          passwordResetToken: 'valid',
          passwordResetTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      await authPasswordResetConfirmController(
        {
          password: 'changedpassword',
          token: 'valid',
        },
        await testContext(),
      );

      const context = await testContext();
      const { token } = await authSignInController(
        {
          email: 'felipe@scaffoldhub.io',
          password: 'changedpassword',
        },
        context,
      );
      expect(token).not.toBeNull();

      currentUser = await prisma.user.findFirstOrThrow({
        where: { id: currentUser.id },
      });

      expect(currentUser.passwordResetToken).toBeNull();
      expect(currentUser.passwordResetTokenExpiresAt).toBeNull();
    });

    it('rejects short password', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          passwordResetToken: 'valid',
          passwordResetTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      try {
        await authPasswordResetConfirmController(
          {
            password: 'short',
            token: 'valid',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error.errors[0].path).toEqual(['password']);
        expect(error.errors[0].code).toEqual('too_small');
      }
    });

    it('rejects no token', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          passwordResetToken: 'valid',
          passwordResetTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      try {
        await authPasswordResetConfirmController(
          {
            password: 'regularpassword',
            token: '',
          },
          await testContext(),
        );

        fail();
      } catch (error: any) {
        expect(error.errors[0].path).toEqual(['token']);
        expect(error.errors[0].code).toEqual('too_small');
      }
    });
  });
});
