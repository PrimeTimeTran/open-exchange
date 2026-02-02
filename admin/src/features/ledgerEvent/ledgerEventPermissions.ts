import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const ledgerEventPermissions = {
  ledgerEventImport: {
    id: 'ledgerEventImport',
    allowedRoles: [roles.admin],
  },

  ledgerEventCreate: {
    id: 'ledgerEventCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  ledgerEventUpdate: {
    id: 'ledgerEventUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  ledgerEventRead: {
    id: 'ledgerEventRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  ledgerEventAutocomplete: {
    id: 'ledgerEventAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  ledgerEventDestroy: {
    id: 'ledgerEventDestroy',
    allowedRoles: [roles.admin],
  },

  ledgerEventArchive: {
    id: 'ledgerEventArchive',
    allowedRoles: [],
  },

  ledgerEventRestore: {
    id: 'ledgerEventRestore',
    allowedRoles: [],
  },

};
