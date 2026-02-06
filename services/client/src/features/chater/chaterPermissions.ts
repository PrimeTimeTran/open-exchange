import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const chaterPermissions = {
  chaterImport: {
    id: 'chaterImport',
    allowedRoles: [roles.admin],
  },

  chaterCreate: {
    id: 'chaterCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  chaterUpdate: {
    id: 'chaterUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  chaterRead: {
    id: 'chaterRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  chaterAutocomplete: {
    id: 'chaterAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  chaterDestroy: {
    id: 'chaterDestroy',
    allowedRoles: [roles.admin],
  },

  chaterArchive: {
    id: 'chaterArchive',
    allowedRoles: [],
  },

  chaterRestore: {
    id: 'chaterRestore',
    allowedRoles: [],
  },

};
