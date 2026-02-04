import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const balanceSnapshotPermissions = {
  balanceSnapshotImport: {
    id: 'balanceSnapshotImport',
    allowedRoles: [roles.admin],
  },

  balanceSnapshotCreate: {
    id: 'balanceSnapshotCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  balanceSnapshotUpdate: {
    id: 'balanceSnapshotUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [],
  },

  balanceSnapshotRead: {
    id: 'balanceSnapshotRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  balanceSnapshotAutocomplete: {
    id: 'balanceSnapshotAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  balanceSnapshotDestroy: {
    id: 'balanceSnapshotDestroy',
    allowedRoles: [roles.admin],
  },

  balanceSnapshotArchive: {
    id: 'balanceSnapshotArchive',
    allowedRoles: [],
  },

  balanceSnapshotRestore: {
    id: 'balanceSnapshotRestore',
    allowedRoles: [],
  },

};
