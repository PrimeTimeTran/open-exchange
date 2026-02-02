import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const articlePermissions = {
  articleImport: {
    id: 'articleImport',
    allowedRoles: [roles.admin],
  },

  articleCreate: {
    id: 'articleCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.articleImages.id, storage.articleFiles.id],
  },

  articleUpdate: {
    id: 'articleUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.articleImages.id, storage.articleFiles.id],
  },

  articleRead: {
    id: 'articleRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  articleAutocomplete: {
    id: 'articleAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  articleDestroy: {
    id: 'articleDestroy',
    allowedRoles: [roles.admin],
  },

  articleArchive: {
    id: 'articleArchive',
    allowedRoles: [],
  },

  articleRestore: {
    id: 'articleRestore',
    allowedRoles: [],
  },

};
