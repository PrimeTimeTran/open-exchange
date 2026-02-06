import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const postPermissions = {
  postImport: {
    id: 'postImport',
    allowedRoles: [roles.admin],
  },

  postCreate: {
    id: 'postCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.postFiles.id, storage.postImages.id],
  },

  postUpdate: {
    id: 'postUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.postFiles.id, storage.postImages.id],
  },

  postRead: {
    id: 'postRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  postAutocomplete: {
    id: 'postAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  postDestroy: {
    id: 'postDestroy',
    allowedRoles: [roles.admin],
  },

  postArchive: {
    id: 'postArchive',
    allowedRoles: [roles.admin],
  },

  postRestore: {
    id: 'postRestore',
    allowedRoles: [roles.admin],
  },

};
