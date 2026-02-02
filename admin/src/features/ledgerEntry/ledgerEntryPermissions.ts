import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const ledgerEntryPermissions = {
  ledgerEntryImport: {
    id: 'ledgerEntryImport',
    allowedRoles: [roles.admin],
  },

  ledgerEntryCreate: {
    id: 'ledgerEntryCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  ledgerEntryUpdate: {
    id: 'ledgerEntryUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  ledgerEntryRead: {
    id: 'ledgerEntryRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  ledgerEntryAutocomplete: {
    id: 'ledgerEntryAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  ledgerEntryDestroy: {
    id: 'ledgerEntryDestroy',
    allowedRoles: [roles.admin],
  },

  ledgerEntryArchive: {
    id: 'ledgerEntryArchive',
    allowedRoles: [],
  },

  ledgerEntryRestore: {
    id: 'ledgerEntryRestore',
    allowedRoles: [],
  },

};
