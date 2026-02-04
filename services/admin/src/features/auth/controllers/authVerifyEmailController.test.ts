import { User } from '@prisma/client';
import dayjs from 'dayjs';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { authVerifyEmailConfirmController } from 'src/features/auth/controllers/authVerifyEmailConfirmController';
import { authVerifyEmailRequestController } from 'src/features/auth/controllers/authVerifyEmailRequestController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error400 from 'src/shared/errors/Error400';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('authVerifyEmail', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
    process.env.AUTH_BYPASS_EMAIL_VERIFICATION = false;
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
    it('send email verify request', async () => {
      mockSendEmail.mockClear();

      await authVerifyEmailRequestController(
        await testContext({
          currentUserId: currentUser.id,
        }),
      );

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('fills verify email token and expiration', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          verifyEmailToken: null,
          verifyEmailTokenExpiresAt: null,
        },
      });

      await authVerifyEmailRequestController(
        await testContext({
          currentUserId: currentUser.id,
        }),
      );

      currentUser = await prisma.user.findFirstOrThrow();
      expect(currentUser.verifyEmailToken).toBeTruthy();
      expect(currentUser.verifyEmailTokenExpiresAt).toBeTruthy();
    });

    it('fails when user not authenticated', async () => {
      try {
        await authVerifyEmailRequestController(await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('confirm', () => {
    it('rejects invalid email token', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          verifyEmailToken: 'valid',
          verifyEmailTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      try {
        await authVerifyEmailConfirmController(
          {
            token: 'invalid',
          },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error400);
        expect(error.message).toEqual(
          'Email verification link is invalid or has expired',
        );
      }
    });

    it('rejects expired token', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          verifyEmailToken: 'valid',
          // past date
          verifyEmailTokenExpiresAt: dayjs().subtract(1, 'day').toDate(),
        },
      });

      try {
        await authVerifyEmailConfirmController(
          {
            token: 'valid',
          },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error400);
        expect(error.message).toEqual(
          'Email verification link is invalid or has expired',
        );
      }
    });

    it('verifies email - even if not authenticated - and clear token from db', async () => {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          verifyEmailToken: 'valid',
          verifyEmailTokenExpiresAt: dayjs().add(1, 'day').toDate(),
        },
      });

      await authVerifyEmailConfirmController(
        { token: 'valid' },
        await testContext(),
      );

      currentUser = await prisma.user.findFirstOrThrow({
        where: { id: currentUser.id },
      });

      expect(currentUser.emailVerified).toBe(true);

      expect(currentUser.verifyEmailToken).toBeNull();
      expect(currentUser.verifyEmailTokenExpiresAt).toBeNull();
    });
  });
});
