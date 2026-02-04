import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const walletPermissions = {
  walletImport: {
    id: 'walletImport',
    allowedRoles: [roles.admin],
  },

  walletCreate: {
    id: 'walletCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  walletUpdate: {
    id: 'walletUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  walletRead: {
    id: 'walletRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  walletAutocomplete: {
    id: 'walletAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  walletDestroy: {
    id: 'walletDestroy',
    allowedRoles: [roles.admin],
  },

  walletArchive: {
    id: 'walletArchive',
    allowedRoles: [],
  },

  walletRestore: {
    id: 'walletRestore',
    allowedRoles: [],
  },

};
