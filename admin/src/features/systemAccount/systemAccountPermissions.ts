import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const systemAccountPermissions = {
  systemAccountImport: {
    id: 'systemAccountImport',
    allowedRoles: [roles.admin],
  },

  systemAccountCreate: {
    id: 'systemAccountCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  systemAccountUpdate: {
    id: 'systemAccountUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  systemAccountRead: {
    id: 'systemAccountRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  systemAccountAutocomplete: {
    id: 'systemAccountAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  systemAccountDestroy: {
    id: 'systemAccountDestroy',
    allowedRoles: [roles.admin],
  },

  systemAccountArchive: {
    id: 'systemAccountArchive',
    allowedRoles: [],
  },

  systemAccountRestore: {
    id: 'systemAccountRestore',
    allowedRoles: [],
  },

};
