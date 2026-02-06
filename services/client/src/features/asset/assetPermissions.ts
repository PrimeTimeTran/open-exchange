import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const assetPermissions = {
  assetImport: {
    id: 'assetImport',
    allowedRoles: [roles.admin],
  },

  assetCreate: {
    id: 'assetCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  assetUpdate: {
    id: 'assetUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  assetRead: {
    id: 'assetRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  assetAutocomplete: {
    id: 'assetAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  assetDestroy: {
    id: 'assetDestroy',
    allowedRoles: [roles.admin],
  },

  assetArchive: {
    id: 'assetArchive',
    allowedRoles: [],
  },

  assetRestore: {
    id: 'assetRestore',
    allowedRoles: [],
  },

};
