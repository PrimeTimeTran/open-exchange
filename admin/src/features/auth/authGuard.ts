import { redirect } from 'next/navigation';
import { Permission, permissions } from 'src/features/permissions';
import { AppContext } from 'src/shared/controller/appContext';

export function authGuard(
  { currentUser, currentMembership }: AppContext,
  permission?: string,
  currentUrl?: string,
) {
  if (!currentUser) {
    if (currentUrl) {
      return redirect(
        `/auth/sign-in?redirect=${encodeURIComponent(currentUrl)}`,
      );
    } else {
      return redirect(`/auth/sign-in`);
    }
  }

  if (!currentUser.emailVerified) {
    return redirect(`/auth/verify-email/request`);
  }

  if (!currentMembership) {
    if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
      return redirect(`/auth/tenant`);
    } else {
      return redirect(`/auth/no-permissions`);
    }
  }

  if (!currentMembership.firstName) {
    return redirect(`/auth/profile-onboard`);
  }

  if (permission) {
    const permissionConfig = Object.values(permissions).find(
      (item) => item.id === permission,
    ) as Permission;

    if (
      !permissionConfig ||
      !currentMembership.roles.some((role) =>
        permissionConfig.allowedRoles.includes(role),
      )
    ) {
      return redirect(`/`);
    }
  }
}
