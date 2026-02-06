import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const tradePermissions = {
  tradeImport: {
    id: 'tradeImport',
    allowedRoles: [roles.admin],
  },

  tradeCreate: {
    id: 'tradeCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  tradeUpdate: {
    id: 'tradeUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  tradeRead: {
    id: 'tradeRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  tradeAutocomplete: {
    id: 'tradeAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  tradeDestroy: {
    id: 'tradeDestroy',
    allowedRoles: [roles.admin],
  },

  tradeArchive: {
    id: 'tradeArchive',
    allowedRoles: [],
  },

  tradeRestore: {
    id: 'tradeRestore',
    allowedRoles: [],
  },

};
