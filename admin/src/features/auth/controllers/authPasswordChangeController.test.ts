import { User } from '@prisma/client';
import { authPasswordChangeController } from 'src/features/auth/controllers/authPasswordChangeController';
import { authSignInController } from 'src/features/auth/controllers/authSignInController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { testContext } from 'src/shared/test/testContext';
import { ZodError } from 'zod';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('authPasswordChange', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: 'CORRECT_password',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();
  });

  it('changes password', async () => {
    await authPasswordChangeController(
      {
        oldPassword: 'CORRECT_password',
        newPassword: 'UPDATED_password',
      },
      await testContext({
        currentUserId: currentUser?.id,
      }),
    );

    const { token } = await authSignInController(
      {
        email: 'felipe@scaffoldhub.io',
        password: 'UPDATED_password',
      },
      await testContext(),
    );
    expect(token).not.toBeNull();
  });

  it('rejects wrong old password', async () => {
    try {
      await authPasswordChangeController(
        {
          oldPassword: 'wrongOldPassword',
          newPassword: 'UPDATED_password',
        },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.message).toEqual('The old password is wrong');
    }
  });

  it('rejects empty old password', async () => {
    try {
      await authPasswordChangeController(
        {
          oldPassword: '',
          newPassword: 'UPDATED_password',
        },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
      fail();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors[0].path).toEqual(['oldPassword']);
        expect(error.errors[0].code).toEqual('too_small');
      }
    }
  });

  it('rejects short new password', async () => {
    try {
      await authPasswordChangeController(
        {
          oldPassword: 'CORRECT_password',
          newPassword: 'short',
        },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
      fail();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors[0].path).toEqual(['newPassword']);
        expect(error.errors[0].code).toEqual('too_small');
      }
    }
  });
});
