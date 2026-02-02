import { UserWithMemberships } from 'src/features/user/userSchemas';

export function userCleanupForResponse(user: UserWithMemberships) {
  const userWithoutPassword = {
    ...user,
    password: undefined,
    passwordResetToken: undefined,
    passwordResetTokenExpiresAt: undefined,
    verifyEmailToken: undefined,
    verifyEmailTokenExpiresAt: undefined,
  };

  return userWithoutPassword;
}
