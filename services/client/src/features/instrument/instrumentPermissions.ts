import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const instrumentPermissions = {
  instrumentImport: {
    id: 'instrumentImport',
    allowedRoles: [roles.admin],
  },

  instrumentCreate: {
    id: 'instrumentCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  instrumentUpdate: {
    id: 'instrumentUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  instrumentRead: {
    id: 'instrumentRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  instrumentAutocomplete: {
    id: 'instrumentAutocomplete',
    allowedRoles: [roles.admin, roles.custom, roles.user],
  },

  instrumentDestroy: {
    id: 'instrumentDestroy',
    allowedRoles: [roles.admin],
  },

  instrumentArchive: {
    id: 'instrumentArchive',
    allowedRoles: [],
  },

  instrumentRestore: {
    id: 'instrumentRestore',
    allowedRoles: [],
  },
};
