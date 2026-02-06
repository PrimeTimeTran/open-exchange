import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const userNotificationPermissions = {
  userNotificationImport: {
    id: 'userNotificationImport',
    allowedRoles: [roles.admin],
  },

  userNotificationCreate: {
    id: 'userNotificationCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  userNotificationUpdate: {
    id: 'userNotificationUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  userNotificationRead: {
    id: 'userNotificationRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  userNotificationAutocomplete: {
    id: 'userNotificationAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  userNotificationDestroy: {
    id: 'userNotificationDestroy',
    allowedRoles: [roles.admin],
  },

  userNotificationArchive: {
    id: 'userNotificationArchive',
    allowedRoles: [],
  },

  userNotificationRestore: {
    id: 'userNotificationRestore',
    allowedRoles: [],
  },

};
