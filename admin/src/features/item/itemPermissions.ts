import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const itemPermissions = {
  itemImport: {
    id: 'itemImport',
    allowedRoles: [roles.admin],
  },

  itemCreate: {
    id: 'itemCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.itemPhotos.id, storage.itemFiles.id],
  },

  itemUpdate: {
    id: 'itemUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.itemPhotos.id, storage.itemFiles.id],
  },

  itemRead: {
    id: 'itemRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  itemAutocomplete: {
    id: 'itemAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  itemDestroy: {
    id: 'itemDestroy',
    allowedRoles: [roles.admin],
  },

  itemArchive: {
    id: 'itemArchive',
    allowedRoles: [],
  },

  itemRestore: {
    id: 'itemRestore',
    allowedRoles: [],
  },

};
