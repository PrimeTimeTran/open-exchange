import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const withdrawalPermissions = {
  withdrawalImport: {
    id: 'withdrawalImport',
    allowedRoles: [roles.admin],
  },

  withdrawalCreate: {
    id: 'withdrawalCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  withdrawalUpdate: {
    id: 'withdrawalUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  withdrawalRead: {
    id: 'withdrawalRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  withdrawalAutocomplete: {
    id: 'withdrawalAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  withdrawalDestroy: {
    id: 'withdrawalDestroy',
    allowedRoles: [roles.admin],
  },

  withdrawalArchive: {
    id: 'withdrawalArchive',
    allowedRoles: [],
  },

  withdrawalRestore: {
    id: 'withdrawalRestore',
    allowedRoles: [],
  },

};
