import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';

export const commentPermissions = {
  commentImport: {
    id: 'commentImport',
    allowedRoles: [roles.admin],
  },

  commentCreate: {
    id: 'commentCreate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.commentImages.id],
  },

  commentUpdate: {
    id: 'commentUpdate',
    allowedRoles: [roles.admin],
    allowedStorage: [storage.commentImages.id],
  },

  commentRead: {
    id: 'commentRead',
    allowedRoles: [roles.admin, roles.custom],
  },

  commentAutocomplete: {
    id: 'commentAutocomplete',
    allowedRoles: [roles.admin, roles.custom],
  },

  commentDestroy: {
    id: 'commentDestroy',
    allowedRoles: [roles.admin],
  },

  commentArchive: {
    id: 'commentArchive',
    allowedRoles: [],
  },

  commentRestore: {
    id: 'commentRestore',
    allowedRoles: [],
  },

};
