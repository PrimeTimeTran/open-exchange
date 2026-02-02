import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const chateePermissions = {
  chateeImport: {
    id: 'chateeImport',
    allowedRoles: [roles.admin],
  },

  chateeCreate: {
    id: 'chateeCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  chateeUpdate: {
    id: 'chateeUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  chateeRead: {
    id: 'chateeRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  chateeAutocomplete: {
    id: 'chateeAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  chateeDestroy: {
    id: 'chateeDestroy',
    allowedRoles: [roles.admin],
  },

  chateeArchive: {
    id: 'chateeArchive',
    allowedRoles: [],
  },

  chateeRestore: {
    id: 'chateeRestore',
    allowedRoles: [],
  },

};
