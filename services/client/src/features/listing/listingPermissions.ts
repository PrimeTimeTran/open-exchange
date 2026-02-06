import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const listingPermissions = {
  listingImport: {
    id: 'listingImport',
    allowedRoles: [roles.admin],
  },

  listingCreate: {
    id: 'listingCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  listingUpdate: {
    id: 'listingUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  listingRead: {
    id: 'listingRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  listingAutocomplete: {
    id: 'listingAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  listingDestroy: {
    id: 'listingDestroy',
    allowedRoles: [roles.admin],
  },

  listingArchive: {
    id: 'listingArchive',
    allowedRoles: [],
  },

  listingRestore: {
    id: 'listingRestore',
    allowedRoles: [],
  },

};
