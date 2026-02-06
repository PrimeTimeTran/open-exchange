import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const marketMakerPermissions = {
  marketMakerImport: {
    id: 'marketMakerImport',
    allowedRoles: [roles.admin],
  },

  marketMakerCreate: {
    id: 'marketMakerCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  marketMakerUpdate: {
    id: 'marketMakerUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  marketMakerRead: {
    id: 'marketMakerRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  marketMakerAutocomplete: {
    id: 'marketMakerAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  marketMakerDestroy: {
    id: 'marketMakerDestroy',
    allowedRoles: [roles.admin],
  },

  marketMakerArchive: {
    id: 'marketMakerArchive',
    allowedRoles: [],
  },

  marketMakerRestore: {
    id: 'marketMakerRestore',
    allowedRoles: [],
  },

};
