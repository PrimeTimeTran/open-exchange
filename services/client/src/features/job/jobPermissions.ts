import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const jobPermissions = {
  jobImport: {
    id: 'jobImport',
    allowedRoles: [roles.admin],
  },

  jobCreate: {
    id: 'jobCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  jobUpdate: {
    id: 'jobUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  jobRead: {
    id: 'jobRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  jobAutocomplete: {
    id: 'jobAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  jobDestroy: {
    id: 'jobDestroy',
    allowedRoles: [roles.admin],
  },

  jobArchive: {
    id: 'jobArchive',
    allowedRoles: [],
  },

  jobRestore: {
    id: 'jobRestore',
    allowedRoles: [],
  },

};
