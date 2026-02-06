import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const feeSchedulePermissions = {
  feeScheduleImport: {
    id: 'feeScheduleImport',
    allowedRoles: [roles.admin],
  },

  feeScheduleCreate: {
    id: 'feeScheduleCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  feeScheduleUpdate: {
    id: 'feeScheduleUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  feeScheduleRead: {
    id: 'feeScheduleRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  feeScheduleAutocomplete: {
    id: 'feeScheduleAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  feeScheduleDestroy: {
    id: 'feeScheduleDestroy',
    allowedRoles: [roles.admin],
  },

  feeScheduleArchive: {
    id: 'feeScheduleArchive',
    allowedRoles: [],
  },

  feeScheduleRestore: {
    id: 'feeScheduleRestore',
    allowedRoles: [],
  },

};
