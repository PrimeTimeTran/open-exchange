import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { Permission, permissions } from 'src/features/permissions';
import { StorageConfig } from 'src/features/storage';
import { SubscriptionPlan as SubscriptionPlans } from 'src/features/subscription/subscriptionPaidPlans';
import {
  AppContext,
  AppContextAuthenticated,
} from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export function hasStoragePermission(
  storage: StorageConfig,
  context: AppContext,
) {
  if (!context.currentMembership) {
    return false;
  }

  let allowedPermissions =
    Object.values(permissions).filter((permission) =>
      permission.allowedRoles.some(
        (allowedRole) =>
          context?.currentMembership?.roles.includes(allowedRole),
      ),
    ) || [];

  if (context.apiKey) {
    allowedPermissions = allowedPermissions.filter(
      (permission) => context.apiKey?.scopes.includes(permission.id),
    );
  }

  return allowedPermissions.some(
    (permission: Permission) => permission.allowedStorage?.includes(storage.id),
  );
}

export function allowedPermissions(roles: string[]) {
  return Object.values(permissions).filter((permission) =>
    permission.allowedRoles.some((allowedRole) => roles.includes(allowedRole)),
  );
}

export function hasApiKeyPermission(
  permission: Permission,
  context: AppContext,
) {
  if (!context.apiKey) {
    return false;
  }

  return context.apiKey.scopes.some((scope) => scope === permission.id);
}

export function hasRolePermission(permission: Permission, context: AppContext) {
  if (!context.currentMembership) {
    return false;
  }

  return context.currentMembership.roles.some((role) =>
    permission.allowedRoles.some((allowedRole) => allowedRole === role),
  );
}

export function hasPermission(permission: Permission, context: AppContext) {
  if (!context?.currentUser?.emailVerified) {
    return false;
  }

  if (!MembershipStatus.isActive(context?.currentMembership)) {
    return false;
  }

  const _hasRolePermission = hasRolePermission(permission, context);

  if (!_hasRolePermission) {
    return false;
  }

  if (context.apiKey) {
    return hasApiKeyPermission(permission, context);
  }

  return true;
}

export function hasSubscription(
  subscription: SubscriptionPlans,
  context: AppContext,
) {
  return hasSubscriptions([subscription], context);
}

export function hasSubscriptions(
  subscriptions: SubscriptionPlans[],
  context: AppContext,
) {
  if (!context?.currentUser?.emailVerified) {
    return false;
  }

  if (!context?.currentSubscription) {
    return false;
  }

  return subscriptions.some(
    (subscription) =>
      context?.currentSubscription?.stripePriceId ===
      subscription.stripePriceId,
  );
}

export function validateHasPermission(
  permission: Permission,
  context: AppContext,
) {
  if (!hasPermission(permission, context)) {
    throw new Error403();
  }

  return context as AppContextAuthenticated;
}

export function validateIsSignedIn(context: AppContext) {
  if (!context.currentUser) {
    throw new Error403();
  }

  return { currentUser: context.currentUser };
}

export function validateIsSignedInAndEmailVerified(context: AppContext) {
  if (!context?.currentUser) {
    throw new Error403();
  }

  if (!context?.currentUser?.emailVerified) {
    throw new Error403();
  }
}
