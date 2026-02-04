import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const accountPermissions = {
  accountImport: {
    id: 'accountImport',
    allowedRoles: [roles.admin],
  },

  accountCreate: {
    id: 'accountCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  accountUpdate: {
    id: 'accountUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  accountRead: {
    id: 'accountRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  accountAutocomplete: {
    id: 'accountAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  accountDestroy: {
    id: 'accountDestroy',
    allowedRoles: [roles.admin],
  },

  accountArchive: {
    id: 'accountArchive',
    allowedRoles: [],
  },

  accountRestore: {
    id: 'accountRestore',
    allowedRoles: [],
  },

};
