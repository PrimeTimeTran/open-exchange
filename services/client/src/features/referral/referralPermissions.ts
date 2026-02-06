import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const referralPermissions = {
  referralImport: {
    id: 'referralImport',
    allowedRoles: [roles.admin],
  },

  referralCreate: {
    id: 'referralCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  referralUpdate: {
    id: 'referralUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  referralRead: {
    id: 'referralRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  referralAutocomplete: {
    id: 'referralAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  referralDestroy: {
    id: 'referralDestroy',
    allowedRoles: [roles.admin],
  },

  referralArchive: {
    id: 'referralArchive',
    allowedRoles: [],
  },

  referralRestore: {
    id: 'referralRestore',
    allowedRoles: [],
  },

};
