import { roles } from 'src/features/roles';

export const apiKeyPermissions = {
  apiKeyCreate: {
    id: 'apiKeyCreate',
    allowedRoles: [roles.admin, roles.custom],
  },

  apiKeyUpdate: {
    id: 'apiKeyUpdate',
    allowedRoles: [roles.admin, roles.custom],
  },

  apiKeyRead: {
    id: 'apiKeyRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  apiKeyDestroy: {
    id: 'apiKeyDestroy',
    allowedRoles: [roles.admin, roles.custom],
  },

  // Can be used to update all API keys, even if they belong to other members in the tenant
  apiKeyUpdateAllMembers: {
    id: 'apiKeyUpdateAllMembers',
    allowedRoles: [roles.admin],
  },

  // Can be used to destroy all API keys, even if they belong to other members in the tenant
  apiKeyDestroyAllMembers: {
    id: 'apiKeyDestroyAllMembers',
    allowedRoles: [roles.admin],
  },

  // Can be used to read all API keys, even if they belong to other members in the tenant
  apiKeyReadAllMembers: {
    id: 'apiKeyRead',
    allowedRoles: [roles.admin],
  },
};
