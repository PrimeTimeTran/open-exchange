import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const depositPermissions = {
  depositImport: {
    id: 'depositImport',
    allowedRoles: [roles.admin],
  },

  depositCreate: {
    id: 'depositCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  depositUpdate: {
    id: 'depositUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  depositRead: {
    id: 'depositRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  depositAutocomplete: {
    id: 'depositAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  depositDestroy: {
    id: 'depositDestroy',
    allowedRoles: [roles.admin],
  },

  depositArchive: {
    id: 'depositArchive',
    allowedRoles: [],
  },

  depositRestore: {
    id: 'depositRestore',
    allowedRoles: [],
  },

};
