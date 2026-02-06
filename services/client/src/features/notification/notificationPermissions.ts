import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const notificationPermissions = {
  notificationImport: {
    id: 'notificationImport',
    allowedRoles: [roles.admin],
  },

  notificationCreate: {
    id: 'notificationCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  notificationUpdate: {
    id: 'notificationUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  notificationRead: {
    id: 'notificationRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  notificationAutocomplete: {
    id: 'notificationAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  notificationDestroy: {
    id: 'notificationDestroy',
    allowedRoles: [roles.admin],
  },

  notificationArchive: {
    id: 'notificationArchive',
    allowedRoles: [],
  },

  notificationRestore: {
    id: 'notificationRestore',
    allowedRoles: [],
  },

};
