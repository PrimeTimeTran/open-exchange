import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const fillPermissions = {
  fillImport: {
    id: 'fillImport',
    allowedRoles: [roles.admin],
  },

  fillCreate: {
    id: 'fillCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  fillUpdate: {
    id: 'fillUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  fillRead: {
    id: 'fillRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  fillAutocomplete: {
    id: 'fillAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  fillDestroy: {
    id: 'fillDestroy',
    allowedRoles: [roles.admin],
  },

  fillArchive: {
    id: 'fillArchive',
    allowedRoles: [],
  },

  fillRestore: {
    id: 'fillRestore',
    allowedRoles: [],
  },

};
