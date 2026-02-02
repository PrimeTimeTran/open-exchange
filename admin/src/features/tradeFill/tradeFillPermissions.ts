import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const tradeFillPermissions = {
  tradeFillImport: {
    id: 'tradeFillImport',
    allowedRoles: [roles.admin],
  },

  tradeFillCreate: {
    id: 'tradeFillCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  tradeFillUpdate: {
    id: 'tradeFillUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  tradeFillRead: {
    id: 'tradeFillRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  tradeFillAutocomplete: {
    id: 'tradeFillAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  tradeFillDestroy: {
    id: 'tradeFillDestroy',
    allowedRoles: [roles.admin],
  },

  tradeFillArchive: {
    id: 'tradeFillArchive',
    allowedRoles: [],
  },

  tradeFillRestore: {
    id: 'tradeFillRestore',
    allowedRoles: [],
  },

};
