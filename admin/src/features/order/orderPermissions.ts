import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const orderPermissions = {
  orderImport: {
    id: 'orderImport',
    allowedRoles: [roles.admin],
  },

  orderCreate: {
    id: 'orderCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  orderUpdate: {
    id: 'orderUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  orderRead: {
    id: 'orderRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  orderAutocomplete: {
    id: 'orderAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  orderDestroy: {
    id: 'orderDestroy',
    allowedRoles: [roles.admin],
  },

  orderArchive: {
    id: 'orderArchive',
    allowedRoles: [],
  },

  orderRestore: {
    id: 'orderRestore',
    allowedRoles: [],
  },

};
